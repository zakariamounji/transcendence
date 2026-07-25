import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { TranformInterceptor } from './interceptors/tranform.interceptor';

// Comma-separated list in TRUSTED_ORIGINS, with sane dev defaults.
// Same parsing as src/auth/auth.ts, which hands the list to better-auth.
const trustedOrigins = (
  process.env.TRUSTED_ORIGINS ?? 'http://localhost:1337,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function bootstrap() {
  // better-auth reads the raw request stream itself, so Nest must not consume
  // the body before the auth handler runs.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // nginx is the single hop in front of the app; without this every client
  // would be rate limited under the proxy IP instead of its own.
  app.set('trust proxy', 1);

  // The browser sends the session cookie cross-origin, and "*" is rejected
  // together with credentials, so the origins have to be explicit.
  app.enableCors({ origin: trustedOrigins, credentials: true });

  // whitelist + forbidNonWhitelisted strip/reject body fields that no DTO
  // declares, so unknown input never reaches Prisma.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TranformInterceptor());

  // 0.0.0.0 so the container port is reachable from outside Docker.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
