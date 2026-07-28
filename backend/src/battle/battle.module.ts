import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { BattleService } from "./battle.service";
import { BattleController } from "./battle.controller";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [BattleService, UserService],
  controllers: [BattleController],
  exports: [BattleService],
})
export class BattleModule {}
