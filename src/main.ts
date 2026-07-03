import 'dotenv/config'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // hna fin kan3iyt l validation pipe globally
  app.useGlobalInterceptors(new TransformInterceptor()); // hna fin kan3iyt l interceptor globally

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
