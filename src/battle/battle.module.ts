import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { BattleService } from "./battle.service";
import { BattleController } from "./battle.controller";

@Module({
  imports: [DatabaseModule],
  providers: [BattleService],
  controllers: [BattleController],
  exports: [BattleService],
})
export class BattleModule {}
