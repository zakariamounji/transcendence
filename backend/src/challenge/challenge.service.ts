import { Injectable , ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateChallengeDto } from './dto/CreateChallenge.dto';
import { UpdateChallengeDto } from './dto/UpdateChallenge.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ChallengeService {
    constructor(private readonly databaseService: DatabaseService) {}

    async createChallenge(createdById: string, dto: CreateChallengeDto) {
        return this.databaseService.$transaction(async (tx) => {
            // zdt hadi hna
            const existingChallenge = await tx.challenge.findUnique({
                where: { slug: dto.slug },
            });
            // check it wach slug m duplicate o throw exception
            if (existingChallenge) {
                throw new ConflictException('Challenge with this slug already exists');
            }

            const challenge = await tx.challenge.create({
                data: {
                    title: dto.title,
                    slug: dto.slug,
                    description: dto.description,
                    difficulty: dto.difficulty,
                    language: dto.language,
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
                language: dto.language,
                expReward: dto.expReward,
                timeLimitMin: dto.timeLimitMin,
                isPublished: dto.isPublished,
            },
        });
    }
    async deleteChallenge(challengeId: string, userId: string, userRole: UserRole) {
        const challenge = await this.databaseService.challenge.findUnique({
            where: { cid: challengeId },
            include: { _count: { select: { battles: true } } },
        });

        if (!challenge) {
            throw new NotFoundException('Challenge not found');
        }

        if (challenge.createdById !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You do not have permission to delete this challenge');
        }

        if (challenge.createdById === userId && challenge.isPublished && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('Published challenges can only be deleted by an admin');
        }

        if (challenge._count.battles > 0) {
            throw new ConflictException('This challenge has been used in battles and cannot be deleted');
        }

        return this.databaseService.challenge.delete({ where: { cid: challengeId } });
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
