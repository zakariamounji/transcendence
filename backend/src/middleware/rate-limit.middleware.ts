import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {

  private limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,              // 5 requests per IP
    message: {
      message: "Too many requests, try again later",
    },
  });


  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}