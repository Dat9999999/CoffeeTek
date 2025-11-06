import { Test, TestingModule } from '@nestjs/testing';
import { MaterialRemainController } from './material-remain.controller';
import { MaterialRemainService } from './material-remain.service';

describe('MaterialRemainController', () => {
  let controller: MaterialRemainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialRemainController],
      providers: [MaterialRemainService],
    }).compile();

    controller = module.get<MaterialRemainController>(MaterialRemainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
