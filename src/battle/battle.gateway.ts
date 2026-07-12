import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { AuthGuard, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { BattleService } from "./battle.service";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true }, // match your CORS setup
})
@UseGuards(AuthGuard) // every connection/message here requires a valid session
export class BattleGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly battleService: BattleService) {}

  private roomName(battleId: string) {
    return `battle:${battleId}`;
  }

  @SubscribeMessage("battle:join")
  async handleJoin(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string; roomCode?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const battle = await this.battleService.joinBattle(session.user.id, data.battleId, data.roomCode);
    await client.join(this.roomName(data.battleId));

    // tell everyone in the room a new player joined
    this.server.to(this.roomName(data.battleId)).emit("battle:playerJoined", {
      userId: session.user.id,
      battle,
    });
    return battle;
  }

  @SubscribeMessage("battle:leave")
  async handleLeave(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const battle = await this.battleService.leaveBattle(session.user.id, data.battleId);
    await client.leave(this.roomName(data.battleId));

    this.server.to(this.roomName(data.battleId)).emit("battle:playerLeft", {
      userId: session.user.id,
      battle,
    });
    return battle;
  }

  @SubscribeMessage("battle:start")
  async handleStart(
    @Session() session: UserSession,
    @MessageBody() data: { battleId: string },
  ) {
    const battle = await this.battleService.startBattle(session.user.id, data.battleId);

    // notify the whole room the battle has started, with duration for a client-side countdown
    this.server.to(this.roomName(data.battleId)).emit("battle:started", {
      battle,
      durationSeconds: battle.durationSeconds,
      startedAt: battle.startedAt,
    });
    return battle;
  }

  // Called from elsewhere in your backend (judge/game logic), NOT from a client message —
  // this is why it's a plain method, not a @SubscribeMessage handler.
  async broadcastBattleEnded(battleId: string, winnerId: string | null) {
    const battle = await this.battleService.endBattle(battleId, winnerId);
    this.server.to(this.roomName(battleId)).emit("battle:ended", { battle });
    return battle;
  }

  handleDisconnect(client: Socket) {
    // Optional: you could track which battle(s) a socket was in and emit a
    // "player disconnected" event here, without necessarily removing them
    // from the battle (a disconnect isn't the same as leaving on purpose).
  }
}