import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

const AUTH_BASE_PATH = '/api/auth';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // originalUrl is captured now because Express rewrites req.url while a
    // mounted middleware is running.
    const path = req.originalUrl.split('?')[0];

    res.on('finish', () => {
      this.metricsService.recordRequest(
        req.method,
        this.resolveRoute(req, path),
        res.statusCode,
      );
    });

    next();
  }

  // The route pattern (not the raw URL) is used as a label so a client cannot
  // grow the metric cardinality by hitting arbitrary paths.
  private resolveRoute(req: Request, path: string): string {
    // better-auth is mounted as a plain middleware, so Express never fills
    // req.route for it: its traffic is grouped under the base path instead.
    const route: unknown = req.route;
    if (
      route &&
      typeof route === 'object' &&
      'path' in route &&
      typeof route.path === 'string'
    ) {
      return route.path;
    }
    return path.startsWith(AUTH_BASE_PATH) ? AUTH_BASE_PATH : 'unmatched';
  }
}
