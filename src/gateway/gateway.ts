import { OnModuleInit, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { Server, Socket } from 'socket.io';
import { BattleService } from 'src/battle/battle.service';
import { RustboxService } from './RustBox/rustbox.service';
import { CreateBattleDto } from 'src/battle/dto/create-battle.dto';
import { JoinBattleDto } from 'src/battle/dto/join-battle.dto';
import { stderr, stdout } from 'process';
import { stat } from 'fs';
// import { GatewayService } from './gateway.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
@UseGuards(AuthGuard)
export class MyGateway implements OnModuleInit {
  constructor(
    private readonly battleService: BattleService,
    private readonly rustboxService: RustboxService,
    /*private readonly gatewayService: GatewayService*/
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  // @SubscribeMessage('createBattle')
  // async onCreateBattle(@Session() session: UserSession, @MessageBody() data: CreateBattleDto, @ConnectedSocket() client: Socket) {
  //   const battle = await this.battleService.createBattle(session.user.id, data);
  //   await client.join(battle.bid);
  //   return battle; // ack
  // }

  @SubscribeMessage('joinBattle')
  async onJoinBattle(@Session() session: UserSession, @MessageBody() data: JoinBattleDto, @ConnectedSocket() client: Socket) {
    console.log('joinBattle handler invoked', data);
    const battle = await this.battleService.joinBattle(session.user.id, data.battleId, data.roomCode);
    await client.join(battle.bid);

    this.server.to(battle.bid).emit('battle:playerJoined', { userId: session.user.id, battle });
    return battle; // ack
  }

  @SubscribeMessage('leaveBattle')
  async onLeaveBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.leaveBattle(session.user.id, data.battleId);
    await client.leave(data.battleId);

    this.server.to(data.battleId).emit('battle:playerLeft', { userId: session.user.id, battle });
    return battle; // ack
  }

  @SubscribeMessage('startBattle')
  async onStartBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }) {
    const battle = await this.battleService.startBattle(session.user.id, data.battleId);

    this.server.to(data.battleId).emit('battle:started', { battle });
    return battle; // ack
  }

  @SubscribeMessage('endBattle')
  async onEndBattle(@MessageBody() data: { battleId: string }) {
    const battle = await this.battleService.endBattle(data.battleId, null);

    this.server.to(data.battleId).emit('battle:ended', { battle });
    return battle; // ack
  }

  // rate limiter to prevent abuse of the code submission feature
  private limiter = new RateLimiterMemory({ points: 5, duration: 60 });

  private inFlight = new Set<string>();

  @SubscribeMessage('submitCode')
  async onSubmitCode(@Session() session: UserSession, @MessageBody() data, @ConnectedSocket() client: Socket) {
    const userId = session.user.id;

    // Check if the user is rate limited
    try {
      await this.limiter.consume(userId);
    } catch {
      return { verdict: 'RATE_LIMITED', stderr: 'Too many submissions, try again later.' };
    }

    // check if the user already has a submission runing
    if (this.inFlight.has(userId)) {
      return { verdict: 'RATE_LIMITED', stderr: 'A submission is already running.' };
    }
    this.inFlight.add(userId);

    try {
      this.server.to(data.battleId).emit('codeSubmitted', { userId: session.user.id, language: data.language, code: data.code });
      const result = await this.rustboxService.runSubmission(data.language, data.code, data.stdin);
      if (!result || typeof result.verdict === 'undefined') {
        this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result: { verdict: 'RE', stdout: '', stderr: 'Judge returned an invalid response' } });
        return { verdict: 'RE', stdout: '', stderr: 'Judge returned an invalid response' }; // ack
      }
      if (result.verdict === 'AC') {
        const expectedOutput = (await this.battleService.getBattleById(data.battleId)).challenge.expectedOutput;
        const isOutputCorrect = await this.battleService.compareOutput(result.stdout ?? '', expectedOutput);
        if (isOutputCorrect) {
          const finishedBattle = await this.battleService.endBattle(data.battleId, session.user.id);
          this.server.to(data.battleId).emit('battle:playerWon', { userId: session.user.id });
          this.server.to(data.battleId).emit('battle:ended', { battle: finishedBattle });
        } else {
          this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result: { ...result, verdict: 'WA' } });
        }
      }
      else {

          this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result });
      }
      return {
        stderr: result.stderr,
        stdout: result.stdout,
        statusCode: result.statusCode,
        cause: result.cause,
        error_message: result.error_message,
      }; // ack
    }
     finally {
      this.inFlight.delete(userId);
    }
  }

  @SubscribeMessage('getBattlePlayers')
  async onGetBattlePlayers(@MessageBody() data: { battleId: string }) {
    const battle = await this.battleService.getCurrentBattle(data.battleId);
    if (!battle) {
      return { error: 'Battle not found' };
    }
    return battle.players;
  }
}