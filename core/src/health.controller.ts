import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PlatformGraphqlClientService } from './platform-api-adapter/clients';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly platform: PlatformGraphqlClientService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.platform.isHealth('platform'),
    ]);
  }
}