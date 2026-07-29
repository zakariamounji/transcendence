import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from './user/user.module';
import { BattleModule } from './battle/battle.module';
import { GatewayModule } from './gateway/gateway.module';
import { ChallengeModule } from './challenge/challenge.module';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    BattleModule,
    GatewayModule,
    ChallengeModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(
        // {
        //   path: 'api/auth/*',
        //   method: RequestMethod.ALL,
        // },
        {
          path: 'battles/create',
          method: RequestMethod.POST,
        },
        {
          path: 'user/me',
          method: RequestMethod.PATCH,
        },
      );
  }
}
