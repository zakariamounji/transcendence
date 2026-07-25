import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from './user/user.module';
import { BattleModule } from './battle/battle.module';
import { GatewayModule } from './gateway/gateway.module';
import { ChallengeModule } from './challenge/challenge.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';
import {
  AuthCredentialsRateLimitMiddleware,
  AuthRateLimitMiddleware,
  RateLimitMiddleware,
} from './middleware/rate-limit.middleware';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    BattleModule,
    GatewayModule,
    ChallengeModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');

    consumer
      .apply(AuthCredentialsRateLimitMiddleware)
      .forRoutes(
        { path: 'api/auth/sign-in/{*path}', method: RequestMethod.ALL },
        { path: 'api/auth/sign-up/{*path}', method: RequestMethod.ALL },
      );

    consumer
      .apply(AuthRateLimitMiddleware)
      .forRoutes({ path: 'api/auth/{*path}', method: RequestMethod.ALL });

    consumer.apply(RateLimitMiddleware).forRoutes(
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
