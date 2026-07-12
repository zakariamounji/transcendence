import { IsOptional, IsString } from "class-validator";

export class JoinBattleDto {
  @IsOptional()
  @IsString()
  roomCode?: string; // required only when joining a PRIVATE battle
}