import {IsString, MaxLength, IsEnum, IsArray, ArrayNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean} from 'class-validator';
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
    // @ArrayNotEmpty()
    @IsEnum(Language, {each: true})
    language?: Language;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    expReward?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(120)
    timeLimitMin?: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}