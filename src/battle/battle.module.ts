import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { BattleService } from "./battle.service";
import { BattleController } from "./battle.controller";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";

@Module({
  imports: [DatabaseModule],
  providers: [BattleService, UserService],
  controllers: [BattleController],
  exports: [BattleService],
})
export class BattleModule {}
