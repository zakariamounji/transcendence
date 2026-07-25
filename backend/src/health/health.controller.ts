import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('health')
export class HealthController {
  // The Docker healthcheck runs before any user exists, so it stays public.
  @AllowAnonymous()
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
