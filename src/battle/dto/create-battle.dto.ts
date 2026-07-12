import { IsEnum, IsUUID, IsOptional, IsInt, Min, Max } from "class-validator";
import { BattleMode, BattleVisibility } from "@prisma/client";

export class CreateBattleDto {
  @IsEnum(BattleMode)
  mode: BattleMode;

  @IsEnum(BattleVisibility)
  @IsOptional()
  visibility?: BattleVisibility = BattleVisibility.PUBLIC;

  @IsUUID()
  challengeId: string;

  @IsInt()
  @Min(60)
  @Max(3600)
  @IsOptional()
  durationSeconds?: number;
}