import { Test, TestingModule } from '@nestjs/testing';
import { KafkaAdapterService } from 'src/kafka/kafka-adapter.service';

describe('KafkaAdapterService', () => {
  let service: KafkaAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaAdapterService],
    }).compile();

    service = module.get<KafkaAdapterService>(KafkaAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
