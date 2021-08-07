import { Test, TestingModule } from '@nestjs/testing';
import { MessagesEventAdapterService } from './messages-event-adapter.service';

describe('MessagesEventAdapterService', () => {
  let service: MessagesEventAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesEventAdapterService],
    }).compile();

    service = module.get<MessagesEventAdapterService>(MessagesEventAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
