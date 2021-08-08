import { Test, TestingModule } from '@nestjs/testing';
import { TextGenerationPlacholderService } from './text-generation-placholder.service';

describe('TextGenerationPlacholderService', () => {
  let service: TextGenerationPlacholderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextGenerationPlacholderService],
    }).compile();

    service = module.get<TextGenerationPlacholderService>(TextGenerationPlacholderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
