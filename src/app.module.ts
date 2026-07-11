import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from './user/user.module';
import { BattleModule } from './battle/battle.module';
import { ChallengeModule } from './challenge/challenge.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, BattleModule, ChallengeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
