import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { SignInHook } from './hooks/sign-in.hook';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, SignInHook]
})
export class UserModule {}
