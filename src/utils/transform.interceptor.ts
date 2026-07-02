import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor { // like inherits from NestInterceptor, and T is a generic type parameter that allows the interceptor to work with any type of data.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> { // context: Gives you access to everything about the current request , and next: Represents the rest of the pipeline.
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode ?? 200; // ?? use the left side if it's not null/undefined, otherwise use the right side.

    return next.handle().pipe(
      map((data: T) => ({
        statusCode,
        message: 'Success',
        data,
      })),
    ); 
  }
  // next.handle(): pass to the next step in request processing -> controller -> service -> database -> back to controller -> back to `interceptor` -> back to client.
  // .pipe(): it's like "after you get the data from controller, do this next". It's a way to transform the data before sending it back to the client.
  // map: it is a function that takes data with a shape and transforms it into a new shape.
}
