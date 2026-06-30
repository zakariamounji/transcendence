import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserLogger } from './user.logger';

@Module({
  controllers: [UserController],
  providers: [UserService, UserLogger]
})
export class UserModule {}
