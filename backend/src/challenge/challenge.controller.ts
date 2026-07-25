import { Controller, Param, Get, Delete } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { Post, Body } from '@nestjs/common';
import { CreateChallengeDto } from './dto/CreateChallenge.dto';
import { UpdateChallengeDto } from './dto/UpdateChallenge.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@prisma/client';

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  async createChallenge(
    @Session() session: UserSession,
    @Body() dto: CreateChallengeDto,
  ) {
    const createdById = session.user.id;
    return this.challengeService.createChallenge(createdById, dto);
  }

  @Post(':challengeId')
  async updateChallenge(
    @Session() session: UserSession,
    @Param('challengeId') challengeId: string,
    @Body() dto: UpdateChallengeDto,
  ) {
    const userId = session.user.id;
    const userRole = session.user.role as UserRole;
    return this.challengeService.updateChallenge(
      challengeId,
      dto,
      userId,
      userRole,
    );
  }

  @Delete(':challengeId')
  async deleteChallenge(
    @Session() session: UserSession,
    @Param('challengeId') challengeId: string,
  ) {
    const userId = session.user.id;
    const userRole = session.user.role as UserRole;
    return this.challengeService.deleteChallenge(challengeId, userId, userRole);
  }

  @Get()
  async getAllChallenges() {
    return this.challengeService.getAllChallenges();
  }

  @Get('me')
  async getMyChallenges(@Session() session: UserSession) {
    const userId = session.user.id;
    return this.challengeService.getChallengesByUserId(userId);
  }

  @Get(':challengeId')
  async getChallengeById(
    @Session() session: UserSession,
    @Param('challengeId') challengeId: string,
  ) {
    const userId = session.user.id;
    return this.challengeService.getChallengeById(challengeId, userId);
  }
}
