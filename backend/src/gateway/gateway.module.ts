import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { BattleModule } from 'src/battle/battle.module';
import { RustboxService } from './RustBox/rustbox.service';

@Module({
  imports: [BattleModule],
  providers: [MyGateway, RustboxService],
})
export class GatewayModule {}
