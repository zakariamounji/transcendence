import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { BattleMode, BattleStatus, BattleVisibility } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { CreateBattleDto } from "./dto/create-battle.dto";
import { UserService } from "src/user/user.service";


const MAX_PLAYERS_BY_MODE: Record<BattleMode, number> = {
  SOLO: 1,
  DUO: 2,
  GROUP: 8,
};

@Injectable()
export class BattleService {
  constructor(private readonly db: DatabaseService, private readonly userService: UserService) {}

  async createBattle(creatorId: string, dto: CreateBattleDto) {
    const maxPlayers = MAX_PLAYERS_BY_MODE[dto.mode];
    const roomCode = dto.visibility === BattleVisibility.PRIVATE ? this.generateRoomCode() : null;

    return this.db.battle.create({
      data: {
        mode: dto.mode,
        visibility: dto.visibility ?? BattleVisibility.PUBLIC,
        maxPlayers,
        roomCode,
        durationSeconds: dto.durationSeconds ?? 1160,
        creatorId,
        challengeId: dto.challengeId,
        players: { connect: { id: creatorId } }, // creator auto-joins, connect: it is the one that actually creates the relation between the battle and the user
      },
    });
  }

  async joinBattle(userId: string, battleId: string, roomCode?: string) {
    const battle = await this.findBattleOrThrow(battleId, { players: true });

    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException("Battle is not accepting players");
    }
    if (battle.players.length >= battle.maxPlayers) {
      throw new BadRequestException("Battle is full");
    }
    if (battle.visibility === BattleVisibility.PRIVATE && battle.roomCode !== roomCode) {
      throw new ForbiddenException("Invalid room code");
    }
    if (battle.players.some((p) => p.id === userId)) {
      throw new BadRequestException("Already joined");
    }
    // update the player status to IN_BATTLE when they join a battle, using the user service
    this.userService.updateStatus(userId, "IN_BATTLE");

    return this.db.battle.update({
      where: { bid: battleId },
      data: { players: { connect: { id: userId } } },
    });
  }

  async leaveBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException("Cannot leave a battle already in progress");
    }
    // update the player status to ONLINE when they leave a battle, using the user service
    this.userService.updateStatus(userId, "ONLINE");

    return this.db.battle.update({
      where: { bid: battleId },
      data: { players: { disconnect: { id: userId } } },
    });
  }

  async startBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId, { players: true });
    if (battle.creatorId !== userId) {
      throw new ForbiddenException("Only the creator can start the battle");
    }
    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException("Battle already started or finished");
    }
    return this.db.battle.update({
      where: { bid: battleId },
      data: { status: BattleStatus.RUNNING, startedAt: new Date() },
    });
  }

  // Called by your game/judge logic when a battle resolves — not a raw client PATCH
  async endBattle(battleId: string, winnerId: string | null) {
    const battle = await this.findBattleOrThrow(battleId);
    if (battle.status !== BattleStatus.RUNNING) {
      throw new BadRequestException("Battle is not running");
    }
    return this.db.battle.update({
      where: { bid: battleId },
      data: { status: BattleStatus.COMPLETED, endedAt: new Date(), winnerId },
    });
  }

  async cancelBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
    if (battle.creatorId !== userId) {
      throw new ForbiddenException("Only the creator can cancel the battle");
    }
    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException("Cannot cancel a battle already in progress");
    }
    return this.db.battle.update({
      where: { bid: battleId },
      data: { status: BattleStatus.CANCELLED },
    });
  }

  getBattleById(battleId: string) {
    return this.findBattleOrThrow(battleId, { players: true, creator: true, challenge: true });
  }

  getAllBattles(status?: BattleStatus) {
    return this.db.battle.findMany({
      where: { visibility: BattleVisibility.PUBLIC, ...(status && { status }) },
      include: { creator: true, players: true },
      orderBy: { createdAt: "desc" },
    });
  }

  private async findBattleOrThrow(battleId: string, include?: object) {
    const battle = await this.db.battle.findUnique({ where: { bid: battleId }, include: {players: true} });
    if (!battle) throw new NotFoundException(`Battle ${battleId} not found`);
    return battle;
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}
