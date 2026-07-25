import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { genericOAuth } from 'better-auth/plugins'; // for 42 provider

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Comma-separated list in TRUSTED_ORIGINS, with sane dev defaults
// The subset of https://api.intra.42.fr/v2/me this app maps onto a better-auth user.
interface Intra42Profile {
  id: number;
  login: string;
  email: string;
  displayname?: string | null;
  usual_full_name?: string | null;
  image?: {
    link?: string | null;
    versions?: { medium?: string | null };
  } | null;
}

const trustedOrigins = (
  process.env.TRUSTED_ORIGINS ?? 'http://localhost:1337,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,

  advanced: {
    ipAddress: {
      // nginx is the only hop in front of the app, so its forwarded header is
      // the real client. Without this every user shares one rate-limit bucket.
      ipAddressHeaders: ['x-forwarded-for'],
    },
  },

  // hadi zdtha bach better auth i includi l role dyal user f session object
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        input: false, // prevents clients from setting their own role
      },
      status: {
        type: 'string',
        defaultValue: 'OFFLINE',
        input: false, // prevents clients from setting their own status
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
          providerId: '42-school',

          clientId: process.env.SCHOOL42_CLIENT_ID!,
          clientSecret: process.env.SCHOOL42_CLIENT_SECRET!,

          authorizationUrl: 'https://api.intra.42.fr/oauth/authorize',

          tokenUrl: 'https://api.intra.42.fr/oauth/token',

          scopes: ['public'],

          getUserInfo: async (tokens) => {
            const response = await fetch('https://api.intra.42.fr/v2/me', {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });

            const profile = (await response.json()) as Intra42Profile;

            return {
              id: String(profile.id),

              name:
                profile.displayname ?? profile.usual_full_name ?? profile.login,

              email: profile.email,

              image:
                profile.image?.link ??
                profile.image?.versions?.medium ??
                undefined,

              emailVerified: true,
            };
          },
        },
      ],
    }),
  ],
});
