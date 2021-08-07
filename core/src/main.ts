import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport, KafkaOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  

  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get('KAFKA_CLIENT_ID'),
        brokers: [configService.get('KAFKA_BROKER_URL')],
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
