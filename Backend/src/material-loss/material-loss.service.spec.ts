import { Test, TestingModule } from '@nestjs/testing';
import { MaterialLossService } from './material-loss.service';

describe('MaterialLossService', () => {
  let service: MaterialLossService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialLossService],
    }).compile();

    service = module.get<MaterialLossService>(MaterialLossService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
