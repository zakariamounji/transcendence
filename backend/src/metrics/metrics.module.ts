import { Module } from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';
import { MetricsController } from './metrics.controller';

// Process/event-loop/GC metrics (CPU, memory, handles, ...) exposed alongside
// whatever custom metrics get registered later, all on the default registry.
collectDefaultMetrics();

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {}
