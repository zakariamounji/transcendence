import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { BattleModule } from 'src/battle/battle.module';
import { GatewayService } from './gateway.service';


@Module({
    imports: [BattleModule],
    providers: [MyGateway, GatewayService],
})
export class GatewayModule {}
