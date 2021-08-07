import { Test, TestingModule } from '@nestjs/testing';
import { AnswererService } from './answerer.service';

describe('AnswererService', () => {
  let service: AnswererService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswererService],
    }).compile();

    service = module.get<AnswererService>(AnswererService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
