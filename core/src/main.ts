import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport, KafkaOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
      transform: true,
  }));

  const configService = app.get(ConfigService);

  const brokers = [configService.get('KAFKA_BROKER_URL')]

  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get('KAFKA_CLIENT_ID'),
        brokers,
      },
      consumer: {
        groupId: configService.get('KAFKA_CONSUMER_GROUP_ID'),
        allowAutoTopicCreation: true
      }
    }
  });

  await app.startAllMicroservices();

  const port = configService.get('SERVER_PORT');
  await app.listen(port);
}

bootstrap();
