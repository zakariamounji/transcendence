import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { DatabaseService } from "src/database/database.service";

export const createAuth = (db: DatabaseService) =>
  betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });

export type Auth = ReturnType<typeof createAuth>;