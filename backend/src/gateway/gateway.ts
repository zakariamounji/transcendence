import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { BattleStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { BattleService } from 'src/battle/battle.service';
import { JoinBattleDto } from 'src/battle/dto/join-battle.dto';
import { RustboxService } from './RustBox/rustbox.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Comma-separated list in TRUSTED_ORIGINS, with sane dev defaults.
// Browsers reject "*" together with credentials, so the origins must be explicit.
const trustedOrigins = (
  process.env.TRUSTED_ORIGINS ?? 'http://localhost:1337,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

interface SubmitCodePayload {
  battleId: string;
  language: string;
  code: string;
  stdin?: string;
}

@WebSocketGateway({ cors: { origin: trustedOrigins, credentials: true } })
@UseGuards(AuthGuard)
export class MyGateway {
  constructor(
    private readonly battleService: BattleService,
    private readonly rustboxService: RustboxService,
  ) {}

  @WebSocketServer()
  server: Server;

  // rate limiter to prevent abuse of the code submission feature
  private limiter = new RateLimiterMemory({ points: 5, duration: 60 });

  private inFlight = new Set<string>();

  @SubscribeMessage('joinBattle')
  async onJoinBattle(
    @Session() session: UserSession,
    @MessageBody() data: JoinBattleDto,
    @ConnectedSocket() client: Socket,
  ) {
    return this.ack(async () => {
      const battle = await this.battleService.joinBattle(
        session.user.id,
        data.battleId,
        data.roomCode,
      );
      await client.join(battle.bid);

      this.server.to(battle.bid).emit('battle:playersUpdated', {
        battleId: battle.bid,
        players: battle.players,
      });
      return battle;
    });
  }

  @SubscribeMessage('leaveBattle')
  async onLeaveBattle(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.ack(async () => {
      const battle = await this.battleService.leaveBattle(
        session.user.id,
        data.battleId,
      );
      await client.leave(data.battleId);

      this.server.to(data.battleId).emit('battle:playersUpdated', {
        battleId: data.battleId,
        players: battle?.players ?? [],
      });
      return battle;
    });
  }

  @SubscribeMessage('startBattle')
  async onStartBattle(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string },
  ) {
    return this.ack(async () => {
      const battle = await this.battleService.startBattle(
        session.user.id,
        data.battleId,
      );

      this.server.to(data.battleId).emit('battle:started', { battle });
      return battle;
    });
  }

  @SubscribeMessage('endBattle')
  async onEndBattle(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string },
  ) {
    return this.ack(async () => {
      const battle = await this.battleService.getBattleById(data.battleId);
      if (battle.creatorId !== session.user.id) {
        throw new ForbiddenException('Only the creator can end the battle');
      }
      if (battle.status !== BattleStatus.RUNNING) {
        throw new BadRequestException('Battle is not running');
      }

      const endedBattle = await this.battleService.endBattle(
        data.battleId,
        null,
      );
      this.server
        .to(data.battleId)
        .emit('battle:ended', { battle: endedBattle });
      return endedBattle;
    });
  }

  @SubscribeMessage('submitCode')
  async onSubmitCode(
    @Session() session: UserSession,
    @MessageBody() data: SubmitCodePayload,
  ) {
    return this.ack(async () => {
      const userId = session.user.id;

      // Check if the user is rate limited
      try {
        await this.limiter.consume(userId);
      } catch {
        return {
          verdict: 'RATE_LIMITED',
          stderr: 'Too many submissions, try again later.',
        };
      }

      // check if the user already has a submission runing
      if (this.inFlight.has(userId)) {
        return {
          verdict: 'RATE_LIMITED',
          stderr: 'A submission is already running.',
        };
      }
      this.inFlight.add(userId);

      try {
        // server-only read: carries the challenge's expected output, never sent to clients
        const battle = await this.battleService.getBattleForJudging(
          data.battleId,
        );
        if (!battle.players.some((player) => player.id === userId)) {
          throw new ForbiddenException('You are not in this battle');
        }
        if (battle.status !== BattleStatus.RUNNING) {
          throw new BadRequestException('Battle is not running');
        }

        // the source code never leaves the submitter: opponents only learn that someone is submitting
        this.server
          .to(data.battleId)
          .emit('codeSubmitted', { userId, language: data.language });

        const result = await this.rustboxService.runSubmission(
          data.language,
          data.code,
          data.stdin,
        );
        if (!result?.verdict) {
          const invalidResult = {
            verdict: 'RE',
            stdout: '',
            stderr: 'Judge returned an invalid response',
          };
          this.server
            .to(data.battleId)
            .emit('codeResult', { userId, result: invalidResult });
          return invalidResult; // ack
        }

        if (result.verdict !== 'AC') {
          this.server.to(data.battleId).emit('codeResult', { userId, result });
        } else if (
          this.battleService.compareOutput(
            result.stdout ?? '',
            battle.challenge.expectedOutput,
          )
        ) {
          const finishedBattle = await this.battleService.endBattle(
            data.battleId,
            userId,
          );
          this.server
            .to(data.battleId)
            .emit('battle:playerWon', { battleId: data.battleId, userId });
          this.server
            .to(data.battleId)
            .emit('battle:ended', { battle: finishedBattle });
        } else {
          this.server.to(data.battleId).emit('codeResult', {
            userId,
            result: { ...result, verdict: 'WA' },
          });
        }

        return {
          stderr: result.stderr,
          stdout: result.stdout,
          statusCode: result.statusCode,
          cause: result.cause,
          error_message: result.error_message,
        }; // ack
      } finally {
        this.inFlight.delete(userId);
      }
    });
  }

  @SubscribeMessage('getBattlePlayers')
  async onGetBattlePlayers(@MessageBody() data: { battleId: string }) {
    return this.ack(async () => {
      const battle = await this.battleService.getBattleById(data.battleId);
      return battle.players;
    });
  }

  // Exceptions thrown inside a @SubscribeMessage handler never reach the client,
  // so every handler answers with its result or with the { error } shape the frontend expects.
  private async ack<T>(
    handler: () => Promise<T>,
  ): Promise<T | { error: string }> {
    try {
      return await handler();
    } catch (error) {
      return {
        error:
          error instanceof HttpException
            ? error.message
            : 'Internal server error',
      };
    }
  }
}
