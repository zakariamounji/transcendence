import { OnModuleInit, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { Server, Socket } from 'socket.io';
import { BattleService } from 'src/battle/battle.service';
import { CreateBattleDto } from 'src/battle/dto/create-battle.dto';
import { JoinBattleDto } from 'src/battle/dto/join-battle.dto';

@WebSocketGateway()
@UseGuards(AuthGuard)
export class MyGateway implements OnModuleInit{
  constructor(private readonly battleService: BattleService) {}

  @WebSocketServer() // Decorator to inject the WebSocket server instance
  server: Server; // we need it to give messages back to the client

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  @SubscribeMessage('joinBattle')
  async onJoinBattle(@Session() session: UserSession, @MessageBody() data: JoinBattleDto, @ConnectedSocket() client: Socket) {

    const battle = await this.battleService.joinBattle(session.user.id, client.id, data.roomCode);
    await client.join(battle.bid); // Join the socket.io room with the battle ID

    console.log('player: ' + session.user.name + ' joined battle: ' + battle.bid);
    this.server.emit('res', { message: 'player: ' + session.user.name + ' joined battle.'}); // Send a response back to the client
  }

  @SubscribeMessage('createBattle')
  async onCreateBattle (@Session() session: UserSession, @MessageBody() data: CreateBattleDto, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.createBattle(session.user.id, data);
    await client.join(battle.bid);
    return battle;
  }

  @SubscribeMessage('leaveBattle')
  async onLeaveBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    await this.battleService.leaveBattle(session.user.id, data.battleId);
    await client.leave(data.battleId);
    console.log('player: ' + session.user.name + ' left battle: ' + data.battleId);
    this.server.emit('res', { message: 'player: ' + session.user.name + ' left battle.'}); // Send a response back to the client
  }

  @SubscribeMessage('startBattle')
  async onStartBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    await this.battleService.startBattle(session.user.id, data.battleId);
    console.log('player: ' + session.user.name + ' started battle: ' + data.battleId);
    this.server.emit('res', { message: 'player: ' + session.user.name + ' started battle.'}); // Send a response back to the client
  }

  @SubscribeMessage('endBattle')
  async onEndBattle(@Session() session: UserSession, @MessageBody() data: { battleId: string }, @ConnectedSocket() client: Socket) {
    const battle = await this.battleService.getBattleById(data.battleId);
    await this.battleService.endBattle(data.battleId, null);
    console.log('winner: ' + battle.winnerId);
    this.server.emit('res', { message: 'player: ' + battle.winnerId + ' won the battle.'}); // Send a response back to the client
  }
}
