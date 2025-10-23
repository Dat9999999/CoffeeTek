import { Test, TestingModule } from '@nestjs/testing';
import { LoyalLevelService } from './loyal-level.service';

describe('LoyalLevelService', () => {
  let service: LoyalLevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoyalLevelService],
    }).compile();

    service = module.get<LoyalLevelService>(LoyalLevelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
