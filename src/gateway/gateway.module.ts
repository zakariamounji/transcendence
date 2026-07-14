import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { BattleModule } from 'src/battle/battle.module';


@Module({
    imports: [BattleModule],
    providers: [MyGateway],
})
export class GatewayModule {}
