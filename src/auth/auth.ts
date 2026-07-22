import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { genericOAuth } from "better-auth/plugins"; // for 42 provider

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL,
  //ila zdti chi localhost b port wahad khor zido hna bach req twasal
  trustedOrigins: ["http://localhost:3000", "http://localhost:5500", "http://localhost:8080", "http://localhost:1337", "http://10.14.4.9:1337"],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false, // prevents clients from setting their own role
      },
    },
  },


  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  hooks: {}, // for hooks to work
  //----------------------------------------------------------
  // 42 provider 
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "42-school",

          clientId: process.env.SCHOOL42_CLIENT_ID!,
          clientSecret: process.env.SCHOOL42_CLIENT_SECRET!,

          authorizationUrl:
            "https://api.intra.42.fr/oauth/authorize",

          tokenUrl:
            "https://api.intra.42.fr/oauth/token",

          scopes: ["public"],

          getUserInfo: async (tokens) => {
            const response = await fetch(
              "https://api.intra.42.fr/v2/me",
              {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
              }
            );

            const profile = await response.json()


            return {
              id: String(profile.id),

              name:
                profile.displayname ??
                profile.usual_full_name ??
                profile.login,

              email: profile.email,

              image:
                profile.image?.link ??
                profile.image?.versions?.medium ??
                null,

              emailVerified: true,
            };
          },
        }
      ],
    }),
  ],
});