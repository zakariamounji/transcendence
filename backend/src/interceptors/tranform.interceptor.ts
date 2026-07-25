import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Response } from 'express';
import { STATUS_CODES } from 'http';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Every REST response leaves the app in the same envelope, so clients can read
// data and message the same way on every route.
@Injectable()
export class TranformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        const statusCode = response.statusCode ?? 200;
        return {
          statusCode,
          message: STATUS_CODES[statusCode] ?? 'Success',
          data,
        };
      }),
    );
  }
}
