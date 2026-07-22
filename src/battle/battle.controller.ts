import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { Session, type UserSession, AllowAnonymous as PublicRoute } from "@thallesp/nestjs-better-auth";
import { BattleService } from "./battle.service";
import { CreateBattleDto } from "./dto/create-battle.dto";
import { JoinBattleDto } from "./dto/join-battle.dto";
import { BattleStatus } from "@prisma/client";

@Controller("battles")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('create')
  create(@Session() session: UserSession, @Body() dto: CreateBattleDto) {
    return this.battleService.createBattle(session.user.id, dto);
  }

  // @Post(":battleId/join")
  // join(@Session() session: UserSession, @Param("battleId") battleId: string, @Body() dto: JoinBattleDto) {
  //   return this.battleService.joinBattle(session.user.id, battleId, dto.roomCode);
  // }

  // @Post(":battleId/leave")
  // leave(@Session() session: UserSession, @Param("battleId") battleId: string) {
  //   return this.battleService.leaveBattle(session.user.id, battleId);
  // }

  // @Patch(":battleId/start")
  // start(@Session() session: UserSession, @Param("battleId") battleId: string) {
  //   return this.battleService.startBattle(session.user.id, battleId);
  // }

  @Patch(":battleId/cancel")
  cancel(@Session() session: UserSession, @Param("battleId") battleId: string) {
    return this.battleService.cancelBattle(session.user.id, battleId);
  }
  
  @Get('all')
  getAll() {
    return this.battleService.getAllBattles();
  }

  @Get(":battleId")
  getOne(@Param("battleId") battleId: string) {
    return this.battleService.getBattleById(battleId);
  }

}
