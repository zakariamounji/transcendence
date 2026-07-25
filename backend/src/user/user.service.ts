import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async findUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: { joinedBattles: true },
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  updateProfile(id: string, dto: UpdateProfileDto) {
    return this.db.user.update({
      where: { id },
      data: { name: dto.name, image: dto.image },
    });
  }

  updateStatus(id: string, status: UserStatus) {
    return this.db.user.update({
      where: { id },
      data: { status, lastSeen: new Date() },
    });
  }

  async updateStatusFront(id: string, status: UserStatus) {
    if (!Object.values(UserStatus).includes(status))
      throw new BadRequestException(`Invalid status: ${status}`);

    const user = await this.db.user.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    // only the battle flow owns IN_BATTLE: an ONLINE heartbeat must not clear it
    if (user.status === UserStatus.IN_BATTLE && status === UserStatus.ONLINE)
      return this.db.user.update({
        where: { id },
        data: { lastSeen: new Date() },
      });

    return this.db.user.update({
      where: { id },
      data: { status, lastSeen: new Date() },
    });
  }

  findAllUsers() {
    return this.db.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        level: true,
        exp: true,
        wins: true,
        losses: true,
        status: true,
        totalChallengesPlayed: true,
        totalChallengesCreated: true,
      },
      orderBy: [{ level: 'desc' }, { exp: 'desc' }, { wins: 'desc' }],
    });
  }

  // called after a battle resolves — never exposed as an HTTP endpoint
  async applyBattleResult(id: string, won: boolean, expGained: number) {
    const user = await this.db.user.update({
      where: { id },
      data: {
        wins: won ? { increment: 1 } : undefined,
        losses: !won ? { increment: 1 } : undefined,
        exp: { increment: expGained },
        totalChallengesPlayed: { increment: 1 },
        level: { increment: Math.floor(expGained / 100) }, // 100 exp per level
      },
    });

    return user;
  }
}
