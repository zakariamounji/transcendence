import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { BattleMode, BattleStatus, BattleVisibility, UserStatus } from "@prisma/client";
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

  return await this.db.$transaction(async (tx) => {
      const locked = await tx.user.updateMany({
        where: { id: creatorId, status: { not: UserStatus.IN_BATTLE } },
        data: { status: UserStatus.IN_BATTLE },
      });

      if (locked.count === 0) {
        throw new BadRequestException('You are already in another battle');
      }

      return tx.battle.create({
        data: {
          mode: dto.mode,
          visibility: dto.visibility ?? BattleVisibility.PUBLIC,
          maxPlayers,
          roomCode,
          durationSeconds: dto.durationSeconds ?? 900,
          creatorId,
          challengeId: dto.challengeId,
          players: { connect: { id: creatorId } },
        },
      });
    });
  }

  async joinBattle(userId: string, battleId: string, roomCode?: string) {
    const battle = await this.findBattleOrThrow(battleId);
    const user = await this.userService.findUserById(userId);

    if (user.status === UserStatus.IN_BATTLE) {
      throw new BadRequestException("You are already in another battle");
    }

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
    await this.userService.updateStatus(userId, "IN_BATTLE");

    return await this.db.battle.update({
      where: { bid: battleId },
      data: { players: { connect: { id: userId } } },
    });
  }
//---------------------------------------------------------------------- 
  async leaveBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
    // gha zayed, mais mat3ref.
    if (battle.status !== BattleStatus.WAITING && battle.status !== BattleStatus.RUNNING) {
      throw new BadRequestException("Battle is not in a state that allows leaving");
    }
    // check if the user is in the battle
    if (!battle.players.some((p) => p.id === userId)) {
      throw new BadRequestException("You are not in this battle");
    }
    // what is transaction?: it allows you to perform multiple database operations as a single unit of work. If any operation fails, the entire transaction is rolled back, ensuring data integrity.
    // and if another request to leav the battle comes in the middle of this transaction, it will wait until the transaction is complete before proceeding.
    return this.db.$transaction(async (tx) => {
      // status form IN_BATTLE to ONLINE.
      await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.ONLINE },
      });
      // remove the player from the battle
      const updated = await tx.battle.update({
        where: { bid: battleId },
        data: { players: { disconnect: { id: userId } } },
        include: { players: true },
      });
      // if the battle has no more players, delete it
      if (updated.players.length === 0) {
        await tx.user.update({
          where: { id: userId },
          data: { losses: { increment: 1 } },
        });
        await tx.battle.delete({ where: { bid: battleId } });
        return null;
      }
      // if the battle is still waiting, just return the updated battle
      if (battle.status === BattleStatus.WAITING) {
        return updated;
      }

      // RUNNING: the leaver counts as a loss, regardless of how many players remain
      await tx.user.update({
        where: { id: userId },
        data: { losses: { increment: 1 } },
      });

      // battle keeps running — remaining player(s) still need to actually solve it to win
      return updated;
    });
  }
//----------------------------------------------------------------------
  async startBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
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

    // Update winner stats
    if (winnerId) {
      await this.userService.applyBattleResult(winnerId, true, battle.challenge.expReward);
      // Set winner status back to ONLINE
      await this.userService.updateStatus(winnerId, "ONLINE");
    }

    // Update loser stats for all other players
    for (const player of battle.players) {
      if (player.id !== winnerId) {
        await this.userService.applyBattleResult(player.id, false, 0); // or give some consolation exp
        // Set loser status back to ONLINE
        await this.userService.updateStatus(player.id, "ONLINE");
      }
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
    return this.findBattleOrThrow(battleId);
  }

  getAllBattles() {
    return this.db.battle.findMany({
      include: { creator: true, players: true, challenge: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBattleOrThrow(battleId: string) {
    const battle = await this.db.battle.findUnique({ where: { bid: battleId }, include: {players: true, challenge: true} });
    if (!battle) throw new NotFoundException(`Battle ${battleId} not found`);
    return battle;
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  async compareOutput(actualOutput: string, expectedOutput: string): Promise<boolean> {

    const normalize = (output: string) => output.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    return normalize(actualOutput) === normalize(expectedOutput);
  }


  async getCurrentBattle(userId: string) {
    return this.db.battle.findFirst({
      where: {
        players: { some: { id: userId } },
        status: { in: [BattleStatus.WAITING, BattleStatus.RUNNING]},
      },
      include: { players: true, challenge: true },
    });
  }

}
