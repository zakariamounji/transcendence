import { OnModuleInit, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { Server, Socket } from 'socket.io';
import { BattleService } from 'src/battle/battle.service';
import { CreateBattleDto } from 'src/battle/dto/create-battle.dto';
import { JoinBattleDto } from 'src/battle/dto/join-battle.dto';
import { GatewayService } from './gateway.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:8080', credentials: true } })
@UseGuards(AuthGuard)
export class MyGateway implements OnModuleInit {
  constructor(private readonly battleService: BattleService, private readonly gatewayService: GatewayService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  @SubscribeMessage('createBattle')
  async onCreateBattle(@Session() session: UserSession, @MessageBody() data: CreateBattleDto, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.createBattle(session.user.id, data);
    await client.join(battle.bid);
    return battle; // ack
  }

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

  @SubscribeMessage('executeCode')
  async onExecuteCode(@Session() session: UserSession, @MessageBody() data: { battleId: string; code: string }) {
    const result = await this.gatewayService.executeCode(session.user.id, data.battleId, data.code);

    this.server.to(data.battleId).emit('codeExecuted', { userId: session.user.id, result });
    return result; // ack
  }
}