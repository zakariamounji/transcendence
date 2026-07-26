import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { UpdateProfileDto } from "./dto/updateProfile.dto";
import { BattleStatus, UserStatus } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  findUserById(id: string) {
    return this.db.user.findUniqueOrThrow({ where: { id }, include: {joinedBattles: true} });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  updateProfile(id: string, data: UpdateProfileDto) {
    return this.db.user.update({ where: { id }, data });
  }

  updateStatus(id: string, status: UserStatus) {
    return this.db.user.update({ where: { id }, data: { status, lastSeen: new Date() } });
  }

  async updateStatusFront(id: string, status: UserStatus) {
    const U = await this.findUserById(id)
    if (!U)
      throw new NotFoundException(`User with id ${id} not found`);
    if (U.status === UserStatus.IN_BATTLE)
      throw new UnauthorizedException("Cannot set status to IN_BATTLE directly. Use the battle endpoints instead.");
    return this.db.user.update({ where: { id }, data: { status, lastSeen: new Date() } });
  }

  findAllUsers() {
    return this.db.user.findMany({
      orderBy: [
        { level: 'desc' },
        { exp: 'desc' },
        { wins: 'desc' },
        // { globalRank: 'asc' },
      ],
      // select: {
      //   globalRank: true,
      //   name: true,
      //   email: true,
      //   status: true,
      //   level: true,
      //   exp: true,
      //   wins: true,
      //   losses: true,
      //   totalChallengesPlayed: true,
      //   totalChallengesCreated: true,
      //   lastSeen: true,
      // }
    });
  }

  // called after a battle resolves — not exposed as its own public endpoint
  async applyBattleResult(id: string, won: boolean, expGained: number) {
    const userBefore = await this.findUserById(id);

    const totalExp = userBefore.exp + expGained;
    const levelsGained = Math.floor(totalExp / 100);
    const newExp = totalExp % 100;
    const newLevel = userBefore.level + levelsGained;

    return this.db.user.update({
      where: { id },
      data: {
        wins: won ? { increment: 1 } : undefined,
        losses: !won ? { increment: 1 } : undefined,
        exp: newExp,
        totalChallengesPlayed: { increment: 1 },
        level: newLevel,
      },
    });
  }
}