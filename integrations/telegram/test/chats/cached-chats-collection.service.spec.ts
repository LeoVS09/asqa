import { Test, TestingModule } from '@nestjs/testing';
import { CachedChatsCollectionService } from '../../src/chats/cached-chats-collection.service';

describe('CachedStorageService', () => {
  let service: CachedChatsCollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CachedChatsCollectionService],
    }).compile();

    service = module.get<CachedChatsCollectionService>(CachedChatsCollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
