import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from './user/user.module';
import { BattleModule } from './battle/battle.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, BattleModule, GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
