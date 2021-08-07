import { Test, TestingModule } from '@nestjs/testing';
import { LongAnswerService } from './long-answer.service';

describe('LongAnswerService', () => {
  let service: LongAnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LongAnswerService],
    }).compile();

    service = module.get<LongAnswerService>(LongAnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
