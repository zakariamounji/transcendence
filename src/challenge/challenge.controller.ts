import { Controller, Param, Req , Patch, Get, Delete} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { Post, Body } from '@nestjs/common';
import { CreateChallengeDto } from './dto/CreateChallenge.dto';
import { UpdateChallengeDto } from './dto/UpdateChallenge.dto';
import { Session} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('challenges')
export class ChallengeController {
    constructor(private readonly challengeService: ChallengeService) {}
    
    @Post()
    async createChallenge(
        @Session() session: UserSession,
        @Body() dto: CreateChallengeDto
    ) {
        const createdById = session.user.id;
        return this.challengeService.createChallenge(createdById, dto);
    }

    @Patch(':challengeId')
    async updateChallenge(
        @Param('challengeId') challengeId: string,
        @Body() dto: UpdateChallengeDto
    ) {
        return this.challengeService.updateChallenge(challengeId, dto);
    }

    @Delete(':challengeId')
    async deleteChallenge(@Param('challengeId') challengeId: string) {
        return this.challengeService.deleteChallenge(challengeId);
    }
    
    @Get(':challengeId')
    async getChallengeById(@Param('challengeId') challengeId: string) {
        return this.challengeService.getChallengeById(challengeId);
    }
    @Get()
    async getAllChallenges() {
        return this.challengeService.getAllChallenges();
    }
}
