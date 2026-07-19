import {IsString, MaxLength, IsEnum, IsArray, ArrayNotEmpty, IsOptional, IsInt, Min} from 'class-validator';
import {Difficulty, Language} from '@prisma/client';

export class UpdateChallengeDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(140)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(280)
    description?: string;

    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(Language, {each: true})
    language?: Language;

    @IsString()
    @MaxLength(1000)
    subject!: string;

    @IsString()
    @MaxLength(1000)
    expectedOutput!: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    expReward?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    timeLimitMin?: number;
}