import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({
      connectionString: `${process.env.DATABASE_URL}`,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}