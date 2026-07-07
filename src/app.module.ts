import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
// import { Auth } from "./auth/auth.factory"; // mzl ghan9ad hada
import { auth } from 'auth';
// import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, DatabaseModule, AuthModule.forRoot({ auth }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
