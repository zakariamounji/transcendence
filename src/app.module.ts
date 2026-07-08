import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from 'auth';
// import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, AuthModule.forRoot({ auth }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
