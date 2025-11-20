import { Test, TestingModule } from '@nestjs/testing';
import { CotractingController } from './cotracting.controller';
import { CotractingService } from './cotracting.service';

describe('CotractingController', () => {
  let controller: CotractingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotractingController],
      providers: [CotractingService],
    }).compile();

    controller = module.get<CotractingController>(CotractingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
