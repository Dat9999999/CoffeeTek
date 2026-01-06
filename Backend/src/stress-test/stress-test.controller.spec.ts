import { Test, TestingModule } from '@nestjs/testing';
import { StressTestController } from './stress-test.controller';

describe('StressTestController', () => {
  let controller: StressTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StressTestController],
    }).compile();

    controller = module.get<StressTestController>(StressTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
