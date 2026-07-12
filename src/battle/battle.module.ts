import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { BattleService } from "./battle.service";
import { BattleController } from "./battle.controller";
import { BattleGateway } from "./battle.gateway";

@Module({
  imports: [DatabaseModule],
  providers: [BattleService, BattleGateway],
  controllers: [BattleController],
  exports: [BattleService, BattleGateway],
})
export class BattleModule {}