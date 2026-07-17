import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ChallengeTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ChallengeTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.originalUrl ?? request.url;

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - startedAt;
        this.logger.log(`${method} ${path} took ${durationMs}ms`);
      }),
    );
  }
}