import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserLogger } from './user.logger';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserLogger, PrismaService],
})
export class UserModule {}
