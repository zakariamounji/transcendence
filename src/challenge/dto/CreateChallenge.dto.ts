import {IsString, MaxLength, IsEnum, IsArray, ArrayNotEmpty, IsOptional, IsInt, Min} from 'class-validator';
import {Difficulty, Language} from '@prisma/client';

export class CreateChallengeDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(140)
  slug!: string;

  @IsString()
  @MaxLength(280)
  description!: string;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Language, {each: true})
  languages!: Language[];

  @IsOptional()
  @IsInt()
  @Min(1)
  expReward?: number;
}