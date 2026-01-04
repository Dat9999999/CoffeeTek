import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FaceRecognitionService } from './face-recognition.service';

@Module({
  imports: [ConfigModule],
  providers: [FaceRecognitionService],
  exports: [FaceRecognitionService],
})
export class FaceRecognitionModule {}
