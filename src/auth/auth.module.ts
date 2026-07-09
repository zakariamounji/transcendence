import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { DatabaseModule } from "src/database/database.module";
import { DatabaseService } from "src/database/database.service";
// import { createAuth } from "./auth.factory";
import { auth } from "./auth";

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
    }),
  ],
})
export class AuthModule {}