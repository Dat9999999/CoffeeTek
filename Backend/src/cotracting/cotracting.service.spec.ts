import { Test, TestingModule } from '@nestjs/testing';
import { CotractingService } from './cotracting.service';

describe('CotractingService', () => {
  let service: CotractingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CotractingService],
    }).compile();

    service = module.get<CotractingService>(CotractingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
