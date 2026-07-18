import { Injectable , ConflictException} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateChallengeDto } from './dto/CreateChallenge.dto';
import { UpdateChallengeDto } from './dto/UpdateChallenge.dto';

@Injectable()
export class ChallengeService {
    constructor(private readonly databaseService: DatabaseService) {}

    async createChallenge(createdById: string, dto: CreateChallengeDto) {
        return this.databaseService.$transaction(async (tx) => {
            const existingChallenge = await tx.challenge.findUnique({
                where: { slug: dto.slug },
            });

            if (existingChallenge) {
                throw new ConflictException('Challenge with this slug already exists');
            }

            const challenge = await tx.challenge.create({
                data: {
                    title: dto.title,
                    slug: dto.slug,
                    description: dto.description,
                    difficulty: dto.difficulty,
                    languages: dto.languages,
                    subject: dto.subject,
                    expectedOutput: dto.expectedOutput,
                    expReward: dto.expReward,
                    timeLimitMin: dto.timeLimitMin,
                    createdById,
                },
            });

            await tx.user.update({
                where: { id: createdById },
                data: {
                    totalChallengesCreated: { increment: 1 },
                },
            });

            return challenge;
        });
    }
    async updateChallenge(challengeId: string, dto: UpdateChallengeDto) {
        return this.databaseService.challenge.update({
            where: { cid: challengeId },
            data: {
                title: dto.title,
                slug: dto.slug,
                description: dto.description,
                difficulty: dto.difficulty,
                languages: dto.languages,
                expReward: dto.expReward,
                subject: dto.subject,
                expectedOutput: dto.expectedOutput,
                timeLimitMin: dto.timeLimitMin,
            },
        });
    }
    async deleteChallenge(challengeId: string) {
        return this.databaseService.challenge.delete({
            where: { cid: challengeId },
        });
    }

    async getChallengeById(challengeId: string) {
        return this.databaseService.challenge.findUnique({
            where: { cid: challengeId },
        });
    }

    async getAllChallenges() {
        return this.databaseService.challenge.findMany();
    }

    async getChallengesByUserId(userId: string) {
        return this.databaseService.challenge.findMany({
            where: { createdById: userId },
        });
    }
}
