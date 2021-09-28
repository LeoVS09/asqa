import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { PlatformApiAdapterModule } from './platform-api-adapter/platform-api-adapter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    PlatformApiAdapterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
