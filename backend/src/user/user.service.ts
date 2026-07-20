import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { UpdateProfileDto } from "./dto/updateProfile.dto";
import { UserStatus } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  findUserById(id: string) {
    return this.db.user.findUniqueOrThrow({ where: { id } });
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
    const user = await this.db.user.update({
      where: { id },
      data: {
        wins: won ? { increment: 1 } : undefined,
        losses: !won ? { increment: 1 } : undefined,
        exp: { increment: expGained },
        totalChallengesPlayed: {increment: 1},
        level: { increment: Math.floor(expGained / 100) }, // Example leveling system: 100 exp per level
      },
    });

    return user;
  }
}