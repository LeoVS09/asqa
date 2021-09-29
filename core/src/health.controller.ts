import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from "@nestjs/config";
import { PlatformGraphqlClientService } from './platform-api-adapter/clients';
import { generateKafkaClientOptions } from './kafka/kafka.configuration';
import { Transport } from '@nestjs/microservices';

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
      // TODO: MicroserviceHealthIndicator not working for kafka, make other way for health check kafka
    ]);
  }
}