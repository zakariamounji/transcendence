import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { BattleService } from './battle.service';
import { CreateBattleDto } from './dto/create-battle.dto';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('create')
  create(@Session() session: UserSession, @Body() dto: CreateBattleDto) {
    return this.battleService.createBattle(session.user.id, dto);
  }

  @Patch(':battleId/cancel')
  cancel(@Session() session: UserSession, @Param('battleId') battleId: string) {
    return this.battleService.cancelBattle(session.user.id, battleId);
  }

  @Get('current')
  getCurrentBattle(@Session() session: UserSession) {
    return this.battleService.getCurrentBattle(session.user.id);
  }

  @Get('all')
  getAll() {
    return this.battleService.getAllBattles();
  }

  @Get(':battleId')
  getOne(@Param('battleId') battleId: string) {
    return this.battleService.getBattleById(battleId);
  }
}
