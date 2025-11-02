import { Test, TestingModule } from '@nestjs/testing';
import { MaterialLossController } from './material-loss.controller';
import { MaterialLossService } from './material-loss.service';

describe('MaterialLossController', () => {
  let controller: MaterialLossController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialLossController],
      providers: [MaterialLossService],
    }).compile();

    controller = module.get<MaterialLossController>(MaterialLossController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
