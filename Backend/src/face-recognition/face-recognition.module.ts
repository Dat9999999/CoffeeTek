import { Module } from '@nestjs/common';
import { FaceRecognitionService } from './face-recognition.service';

@Module({
  providers: [FaceRecognitionService],
  exports: [FaceRecognitionService],
})
export class FaceRecognitionModule {}
