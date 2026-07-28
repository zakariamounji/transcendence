import { Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
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

import { REDIS_CLIENT } from 'src/battle/redis/redis.module';
import Redis from 'ioredis';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
@UseGuards(AuthGuard)
export class MyGateway implements OnModuleInit {
  constructor(
    private readonly battleService: BattleService,
    private readonly rustboxService: RustboxService,
    /*private readonly gatewayService: GatewayService*/
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  // one timer per running battle, so a battle that runs out of time closes itself
  private closers = new Map<string, NodeJS.Timeout>();

  /**
   * What each player of a battle is doing, by user id: 'running' while the judge has
   * their code, then the verdict it came back with, then 'won'.
   *
   * codeSubmitted and codeResult only reach whoever happened to be in the room at
   * that second, so a page that opens late, or a socket that reconnected, knew
   * nothing about anybody else. Keeping it here is what lets them catch up.
   */
  private activity = new Map<string, Record<string, string>>();

  private setActivity(battleId: string, userId: string, doing: string) {
    const next = { ...(this.activity.get(battleId) ?? {}), [userId]: doing };
    this.activity.set(battleId, next);
    this.server.to(battleId).emit('battle:activity', { battleId, activity: next });
  }

  // tells every client, in a room or not, that the battle list moved
  private lobbyChanged() {
    this.server.emit('lobby:changed');
  }

  private arm(battleId: string, ms: number) {
    this.disarm(battleId);
    this.closers.set(battleId, setTimeout(() => this.closeOnTime(battleId), Math.max(0, ms)));
  }

  private disarm(battleId: string) {
    const timer = this.closers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.closers.delete(battleId);
    }
  }

  // nobody solved it in time, so the battle ends without a winner
  private async closeOnTime(battleId: string) {
    this.closers.delete(battleId);
    try {
      const battle = await this.battleService.endBattle(battleId, null);
      this.activity.delete(battleId);
      this.server.to(battleId).emit('battle:ended', { battle });
      this.lobbyChanged();
    } catch {
      // somebody already won it, or it is gone
    }
  }

  // the creator has to be inside the room too, otherwise nothing that happens in
  // their own battle ever reaches them
  @SubscribeMessage('createBattle')
  async onCreateBattle(@Session() session: UserSession, @MessageBody() data: CreateBattleDto, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.createBattle(session.user.id, data);
    await client.join(battle.bid);

    this.lobbyChanged();
    return battle; // ack
  }

  /**
   * Walks a player who is already in a battle back into its room. A creator arrives
   * over http, and a reload throws the socket away, so without this neither of them
   * hears another word about their own battle.
   */
  @SubscribeMessage('watchBattle')
  async onWatchBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.getBattleById(data.battleId);

    if (!battle.players.some((p) => p.id === session.user.id)) {
      throw new WsException('You are not in this battle');
    }

    await client.join(battle.bid);

    // this is the catching up: what everyone was doing before this page existed
    client.emit('battle:activity', { battleId: battle.bid, activity: this.activity.get(battle.bid) ?? {} });

    // the process may have been restarted while this one was running, and the timer
    // that was meant to close it died with it
    if (battle.status === 'RUNNING' && battle.startedAt) {
      const endsAt = battle.startedAt.getTime() + battle.durationSeconds * 1000;
      if (endsAt <= Date.now()) await this.closeOnTime(battle.bid);
      else this.arm(battle.bid, endsAt - Date.now());
    }

    return battle; // ack
  }

  @SubscribeMessage('joinBattle')
  async onJoinBattle(@Session() session: UserSession, @MessageBody() data: JoinBattleDto, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.joinBattle(session.user.id, data.battleId, data.roomCode);
    await client.join(battle.bid);

    this.server.to(battle.bid).emit('battle:playersUpdated', { battleId: battle.bid, players: battle.players });
    this.lobbyChanged();
    return battle;
  }

  @SubscribeMessage('leaveBattle')
  async onLeaveBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.leaveBattle(session.user.id, data.battleId);
    await client.leave(data.battleId);

    this.server.to(data.battleId).emit('battle:playersUpdated', { battleId: data.battleId, players: battle?.players });
    this.lobbyChanged();
    return battle;
  }

  @SubscribeMessage('startBattle')
  async onStartBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }) {
    const battle = await this.battleService.startBattle(session.user.id, data.battleId);

    // from here the clock is what ends it, unless somebody solves it first
    this.arm(battle.bid, battle.durationSeconds * 1000);

    this.server.to(data.battleId).emit('battle:started', { battle });
    this.lobbyChanged();
    return battle; // ack
  }

  @SubscribeMessage('endBattle')
  async onEndBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }) {
    const players = (await this.battleService.getBattleById(data.battleId)).players;

    // ending a battle you are not in was open to anyone who knew the id
    if (!players.some((p) => p.id === session.user.id)) {
      throw new WsException('You are not in this battle');
    }

    this.disarm(data.battleId);
    const battle = await this.battleService.endBattle(data.battleId, null);
    this.activity.delete(data.battleId);

    this.server.to(data.battleId).emit('battle:ended', { battle });
    this.lobbyChanged();
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
      const battle = await this.battleService.getBattleById(data.battleId);

      if (!battle.players.some((p) => p.id === userId)) {
        throw new WsException('You are not in this battle');
      }
      if (battle.status !== 'RUNNING') {
        throw new WsException('This battle is not running');
      }

      // the room hears that somebody submitted, never what they wrote
      this.server.to(data.battleId).emit('codeSubmitted', { userId: session.user.id });
      this.setActivity(data.battleId, userId, 'running');

      // the input is the one the challenge was written with, not one the client picked
      const result = await this.rustboxService.runSubmission(data.language, data.code, battle.challenge.subject);
      if (!result || typeof result.verdict === 'undefined') {
        this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result: { verdict: 'RE', stdout: '', stderr: 'Judge returned an invalid response' } });
        this.setActivity(data.battleId, userId, 'RE');
        return { verdict: 'RE', stdout: '', stderr: 'Judge returned an invalid response' }; // ack
      }
      if (result.verdict === 'AC') {
        const isOutputCorrect = await this.battleService.compareOutput(result.stdout ?? '', battle.challenge.expectedOutput);
        if (isOutputCorrect) {
          // it is over, the clock does not get to end it a second time
          this.disarm(data.battleId);
          const finishedBattle = await this.battleService.endBattle(data.battleId, session.user.id);
          this.setActivity(data.battleId, userId, 'won');
          this.activity.delete(data.battleId);
          this.server.to(data.battleId).emit('battle:playerWon', { userId: session.user.id });
          this.server.to(data.battleId).emit('battle:ended', { battle: finishedBattle });
          this.lobbyChanged();
        } else {
          this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result: { ...result, verdict: 'WA' } });
          this.setActivity(data.battleId, userId, 'WA');
        }
      }
      else {

          this.server.to(data.battleId).emit('codeResult', { userId: session.user.id, result });
          // the judge leaves it null when it has nothing to say, which reads as a crash
          this.setActivity(data.battleId, userId, result.verdict ?? 'RE');
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
    const battle = await this.battleService.getBattleById(data.battleId);
    if (!battle) {
      return { error: 'Battle not found' };
    }
    return battle.players;
  }

  @SubscribeMessage('cancelBattle')
  async onCancelBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }) {
    const battle = await this.battleService.cancelBattle(session.user.id, data.battleId);
    this.activity.delete(data.battleId);
    this.server.to(data.battleId).emit('battle:cancelled', { battle });
    this.lobbyChanged();
    return battle; // ack
  }
}