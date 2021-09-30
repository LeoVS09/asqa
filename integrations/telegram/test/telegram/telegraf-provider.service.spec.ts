import { Test, TestingModule } from '@nestjs/testing';
import { TelegrafProviderService } from 'src/telegram/telegraf-provider.service';

describe('TelegrafProviderService', () => {
  let service: TelegrafProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegrafProviderService],
    }).compile();

    service = module.get<TelegrafProviderService>(TelegrafProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
