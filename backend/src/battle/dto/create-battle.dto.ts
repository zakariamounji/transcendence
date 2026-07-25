import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsInt,
  IsString,
  Length,
  Matches,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { BattleMode, BattleVisibility } from '@prisma/client';

export class CreateBattleDto {
  @IsEnum(BattleMode)
  mode!: BattleMode;

  @IsEnum(BattleVisibility)
  @IsOptional()
  visibility?: BattleVisibility = BattleVisibility.PUBLIC;

  @IsUUID()
  challengeId!: string;

  @IsInt()
  @Min(60)
  @Max(3600)
  @IsOptional()
  durationSeconds?: number;

  // Only used for PRIVATE battles; the form submits an empty string when left blank,
  // which means "generate one for me".
  @ValidateIf(
    (dto: CreateBattleDto) => dto.roomCode !== undefined && dto.roomCode !== '',
  )
  @IsString()
  @Length(4, 12)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'roomCode must contain only letters and digits',
  })
  roomCode?: string;
}
