import { Test, TestingModule } from '@nestjs/testing';
import { LoyalLevelController } from './loyal-level.controller';
import { LoyalLevelService } from './loyal-level.service';

describe('LoyalLevelController', () => {
  let controller: LoyalLevelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyalLevelController],
      providers: [LoyalLevelService],
    }).compile();

    controller = module.get<LoyalLevelController>(LoyalLevelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
