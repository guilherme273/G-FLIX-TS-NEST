import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsTypesService } from './reactions_types.service';

describe('ReactionsTypesService', () => {
  let service: ReactionsTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionsTypesService],
    }).compile();

    service = module.get<ReactionsTypesService>(ReactionsTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
