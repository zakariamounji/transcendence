import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { UpdateProfileDto } from "./dto/updateProfile.dto";

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

  updateStatus(id: string, status: "ONLINE" | "OFFLINE" | "IN_BATTLE") {
    return this.db.user.update({ where: { id }, data: { status, lastSeen: new Date() } });
  }

  // called after a battle resolves — not exposed as its own public endpoint
  applyBattleResult(id: string, won: boolean, expGained: number) {
    return this.db.user.update({
      where: { id },
      data: {
        wins: won ? { increment: 1 } : undefined,
        losses: !won ? { increment: 1 } : undefined,
        exp: { increment: expGained },
        totalChallengesPlayed: {increment: 1},
      },
    });
  }
}