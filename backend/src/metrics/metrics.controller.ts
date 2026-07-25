import { Controller, Get, Res } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // Prometheus scrapes without a session, and the body must stay raw
  // Prometheus text: @Res() bypasses the global JSON transform interceptor.
  @AllowAnonymous()
  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    res.type(this.metricsService.contentType);
    res.send(await this.metricsService.metrics());
  }
}
