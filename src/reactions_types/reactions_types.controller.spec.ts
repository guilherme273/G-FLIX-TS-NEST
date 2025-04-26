import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsTypesController } from './reactions_types.controller';
import { ReactionsTypesService } from './reactions_types.service';

describe('ReactionsTypesController', () => {
  let controller: ReactionsTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionsTypesController],
      providers: [ReactionsTypesService],
    }).compile();

    controller = module.get<ReactionsTypesController>(ReactionsTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
