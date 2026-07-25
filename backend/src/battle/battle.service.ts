import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  BattleMode,
  BattleStatus,
  BattleVisibility,
  Prisma,
  UserStatus,
} from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UserService } from 'src/user/user.service';

const MAX_PLAYERS_BY_MODE: Record<BattleMode, number> = {
  SOLO: 1,
  DUO: 2,
  GROUP: 8,
};

// A player as other players in the lobby are allowed to see them: no email, no timestamps.
const PLAYER_SELECT = {
  id: true,
  name: true,
  image: true,
  level: true,
  exp: true,
  wins: true,
  losses: true,
  status: true,
} satisfies Prisma.UserSelect;

// Every battle sent to a client goes through this shape. It deliberately omits
// battle.roomCode (the key to a private room) and challenge.expectedOutput (the
// answer — judging is a plain string compare, so a client that sees it just prints it).
const BATTLE_SELECT = {
  bid: true,
  mode: true,
  status: true,
  visibility: true,
  maxPlayers: true,
  durationSeconds: true,
  createdAt: true,
  startedAt: true,
  endedAt: true,
  creatorId: true,
  winnerId: true,
  challengeId: true,
  creator: { select: PLAYER_SELECT },
  players: { select: PLAYER_SELECT },
  challenge: {
    select: {
      cid: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      language: true,
      expReward: true,
      isPublished: true,
      subject: true,
      timeLimitMin: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.BattleSelect;

@Injectable()
export class BattleService {
  constructor(
    private readonly db: DatabaseService,
    private readonly userService: UserService,
  ) {}

  async createBattle(creatorId: string, dto: CreateBattleDto) {
    const maxPlayers = MAX_PLAYERS_BY_MODE[dto.mode];
    const visibility = dto.visibility ?? BattleVisibility.PUBLIC;
    // only a private room has a code: the creator's own code, or a generated one if they left it blank
    const roomCode =
      visibility === BattleVisibility.PRIVATE
        ? dto.roomCode?.trim().toUpperCase() || this.generateRoomCode()
        : null;

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
          visibility,
          maxPlayers,
          roomCode,
          durationSeconds: dto.durationSeconds ?? 900,
          creatorId,
          challengeId: dto.challengeId,
          players: { connect: { id: creatorId } },
        },
        // the creator is the only client allowed to read the room code
        select: { ...BATTLE_SELECT, roomCode: true },
      });
    });
  }

  async joinBattle(userId: string, battleId: string, roomCode?: string) {
    const battle = await this.findBattleOrThrow(battleId);
    const user = await this.userService.findUserById(userId);

    if (user.status === UserStatus.IN_BATTLE) {
      throw new BadRequestException('You are already in another battle');
    }

    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException('Battle is not accepting players');
    }
    if (battle.players.length >= battle.maxPlayers) {
      throw new BadRequestException('Battle is full');
    }
    // room codes are stored uppercase, so players may type them in any case
    if (
      battle.visibility === BattleVisibility.PRIVATE &&
      battle.roomCode !== roomCode?.trim().toUpperCase()
    ) {
      throw new ForbiddenException('Invalid room code');
    }
    if (battle.players.some((p) => p.id === userId)) {
      throw new BadRequestException('Already joined');
    }
    // update the player status to IN_BATTLE when they join a battle, using the user service
    await this.userService.updateStatus(userId, UserStatus.IN_BATTLE);

    return await this.db.battle.update({
      where: { bid: battleId },
      data: { players: { connect: { id: userId } } },
      select: BATTLE_SELECT,
    });
  }

  async leaveBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);

    if (
      battle.status !== BattleStatus.WAITING &&
      battle.status !== BattleStatus.RUNNING
    ) {
      throw new BadRequestException(
        'Battle is not in a state that allows leaving',
      );
    }
    if (!battle.players.some((p) => p.id === userId)) {
      throw new ForbiddenException('You are not in this battle');
    }

    // a transaction so the player status and the roster always move together
    return this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.ONLINE },
      });

      const updated = await tx.battle.update({
        where: { bid: battleId },
        data: { players: { disconnect: { id: userId } } },
        select: BATTLE_SELECT,
      });

      // leaving a running battle always counts as a loss for the leaver
      if (battle.status === BattleStatus.RUNNING) {
        await tx.user.update({
          where: { id: userId },
          data: { losses: { increment: 1 } },
        });
      }

      // an empty battle is dropped; callers still get a battle with an empty roster
      if (updated.players.length === 0) {
        await tx.battle.delete({ where: { bid: battleId } });
      }

      return updated;
    });
  }

  async startBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
    if (battle.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can start the battle');
    }
    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException('Battle already started or finished');
    }
    return this.db.battle.update({
      where: { bid: battleId },
      data: { status: BattleStatus.RUNNING, startedAt: new Date() },
      select: BATTLE_SELECT,
    });
  }

  // Called by the gateway when a battle resolves — not a raw client PATCH
  async endBattle(battleId: string, winnerId: string | null) {
    const battle = await this.findBattleOrThrow(battleId);
    this.assertBattleRunning(battle);

    if (winnerId && !battle.players.some((p) => p.id === winnerId)) {
      throw new ForbiddenException('The winner is not a player of this battle');
    }

    if (winnerId) {
      await this.userService.applyBattleResult(
        winnerId,
        true,
        battle.challenge.expReward,
      );
      await this.userService.updateStatus(winnerId, UserStatus.ONLINE);
    }

    for (const player of battle.players) {
      if (player.id !== winnerId) {
        await this.userService.applyBattleResult(player.id, false, 0);
        await this.userService.updateStatus(player.id, UserStatus.ONLINE);
      }
    }

    return this.db.battle.update({
      where: { bid: battleId },
      data: { status: BattleStatus.COMPLETED, endedAt: new Date(), winnerId },
      select: BATTLE_SELECT,
    });
  }

  async cancelBattle(userId: string, battleId: string) {
    const battle = await this.findBattleOrThrow(battleId);
    if (battle.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can cancel the battle');
    }
    if (battle.status !== BattleStatus.WAITING) {
      throw new BadRequestException(
        'Cannot cancel a battle already in progress',
      );
    }

    return this.db.$transaction(async (tx) => {
      // everyone in the lobby is locked as IN_BATTLE — release them or they stay stuck
      await tx.user.updateMany({
        where: { id: { in: battle.players.map((p) => p.id) } },
        data: { status: UserStatus.ONLINE },
      });

      return tx.battle.update({
        where: { bid: battleId },
        data: { status: BattleStatus.CANCELLED },
        select: BATTLE_SELECT,
      });
    });
  }

  async getBattleById(battleId: string) {
    const battle = await this.db.battle.findUnique({
      where: { bid: battleId },
      select: BATTLE_SELECT,
    });
    if (!battle) throw new NotFoundException(`Battle ${battleId} not found`);
    return battle;
  }

  getAllBattles() {
    return this.db.battle.findMany({
      select: BATTLE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  getCurrentBattle(userId: string) {
    return this.db.battle.findFirst({
      where: {
        players: { some: { id: userId } },
        status: { in: [BattleStatus.WAITING, BattleStatus.RUNNING] },
      },
      select: BATTLE_SELECT,
    });
  }

  // Server-only: the single read that exposes challenge.expectedOutput. Its result
  // must never be emitted to a socket room or returned from a controller.
  async getBattleForJudging(battleId: string) {
    const battle = await this.db.battle.findUnique({
      where: { bid: battleId },
      select: {
        bid: true,
        status: true,
        players: { select: { id: true } },
        challenge: { select: { language: true, expectedOutput: true } },
      },
    });
    if (!battle) throw new NotFoundException(`Battle ${battleId} not found`);
    return battle;
  }

  // The socket gateway has no per-room guard: it authorises actions through these two.
  async isPlayerInBattle(userId: string, battleId: string): Promise<boolean> {
    const membership = await this.db.battle.findFirst({
      where: { bid: battleId, players: { some: { id: userId } } },
      select: { bid: true },
    });
    return membership !== null;
  }

  async assertPlayerInBattle(userId: string, battleId: string): Promise<void> {
    if (!(await this.isPlayerInBattle(userId, battleId))) {
      throw new ForbiddenException('You are not a player in this battle');
    }
  }

  compareOutput(actualOutput: string, expectedOutput: string): boolean {
    const normalize = (output: string) =>
      output.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    return normalize(actualOutput) === normalize(expectedOutput);
  }

  // Internal: this row still carries roomCode and expectedOutput, so it is only ever
  // used to validate a request, never returned as-is.
  private async findBattleOrThrow(battleId: string) {
    const battle = await this.db.battle.findUnique({
      where: { bid: battleId },
      include: { players: true, challenge: true },
    });
    if (!battle) throw new NotFoundException(`Battle ${battleId} not found`);
    return battle;
  }

  private assertBattleRunning(battle: { status: BattleStatus }): void {
    if (battle.status !== BattleStatus.RUNNING) {
      throw new BadRequestException('Battle is not running');
    }
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}
