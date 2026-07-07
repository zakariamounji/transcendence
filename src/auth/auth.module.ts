import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { DatabaseModule } from "src/database/database.module";
import { DatabaseService } from "src/database/database.service";
import { createAuth } from "./auth.factory";

@Module({
  imports: [
    DatabaseModule,
    BetterAuthModule.forRootAsync({
      imports: [DatabaseModule],
      useFactory: (db: DatabaseService) => ({ auth: createAuth(db) }),
      inject: [DatabaseService],
    }),
  ],
})
export class AuthModule {}