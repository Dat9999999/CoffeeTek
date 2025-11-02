import { Test, TestingModule } from '@nestjs/testing';
import { MaterialRemainService } from './material-remain.service';

describe('MaterialRemainService', () => {
  let service: MaterialRemainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialRemainService],
    }).compile();

    service = module.get<MaterialRemainService>(MaterialRemainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
