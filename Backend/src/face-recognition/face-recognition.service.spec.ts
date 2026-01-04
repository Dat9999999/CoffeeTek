import { Test, TestingModule } from '@nestjs/testing';
import { FaceRecognitionService } from './face-recognition.service';

describe('FaceRecognitionService', () => {
  let service: FaceRecognitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaceRecognitionService],
    }).compile();

    service = module.get<FaceRecognitionService>(FaceRecognitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
