import { Test, TestingModule } from '@nestjs/testing';
import { ChatsCollectionService } from 'src/chats/chats-collection.service';

describe('ChatsCollectionService', () => {
  let service: ChatsCollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsCollectionService],
    }).compile();

    service = module.get<ChatsCollectionService>(ChatsCollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
