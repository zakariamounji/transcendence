import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const perMinute = (limit: number) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit,
    message: {
      message: 'Too many requests, try again later',
    },
  });

// Only sign-in / sign-up are worth brute forcing, so they keep a tight budget.
@Injectable()
export class AuthCredentialsRateLimitMiddleware implements NestMiddleware {
  private readonly limiter = perMinute(10);

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

// The rest of /api/auth/* is session, callback and sign-out traffic: one sign-up
// already fires several of those, and a whole campus shares a single NAT'd IP.
@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly limiter = perMinute(300);

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

// Authenticated writes: enough room for real play, not enough for a script.
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limiter = perMinute(30);

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}
