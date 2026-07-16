import { IsString, IsOptional } from "class-validator";

export class JoinBattleDto {
  @IsString()
  battleId: string;

  @IsOptional()
  @IsString()
  roomCode?: string;
}