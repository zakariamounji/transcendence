import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { TranformInterceptor } from './interceptors/tranform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bodyParser: false}); // required for better auth

  app.useGlobalPipes(new ValidationPipe()); // enables decorators like @IsString() to actually validate the data in the DTOs,
  //  without this, the decorators would not have any effect and the data would not be validated.

  app.useGlobalInterceptors(new TranformInterceptor()); // enables the interceptor to be applied globally,
  // so that all responses from the application will be transformed according to the logic defined in the TranformInterceptor class.

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
