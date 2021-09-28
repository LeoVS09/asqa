import { Test, TestingModule } from '@nestjs/testing';
import { TextGenerationPlaceholderService } from 'src/platform-api-adapter/text-generation-placeholder.service';

describe('TextGenerationPlacholderService', () => {
  let service: TextGenerationPlaceholderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextGenerationPlaceholderService],
    }).compile();

    service = module.get<TextGenerationPlaceholderService>(TextGenerationPlaceholderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
