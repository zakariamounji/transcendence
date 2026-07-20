import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
// import { DatabaseModule } from "src/database/database.module";
// import { DatabaseService } from "src/database/database.service";
import { auth } from "./auth";
// import { createAuth } from "./auth.factory";

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
    }),
  ],
})
export class AuthModule {}