import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Public()
  async getMetrics(@Res() res: Response): Promise<void> {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}
