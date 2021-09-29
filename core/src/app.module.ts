import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { PlatformApiAdapterModule } from './platform-api-adapter/platform-api-adapter.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TerminusModule,
    BotModule,
    PlatformApiAdapterModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}
