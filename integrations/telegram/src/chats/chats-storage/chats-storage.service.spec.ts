import { Test, TestingModule } from '@nestjs/testing';
import { ChatsStorageService } from './chats-storage.service';

describe('ChatsStorageService', () => {
  let service: ChatsStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsStorageService],
    }).compile();

    service = module.get<ChatsStorageService>(ChatsStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
