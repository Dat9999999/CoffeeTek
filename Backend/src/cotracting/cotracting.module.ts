import { Module } from '@nestjs/common';
import { CotractingService } from './cotracting.service';
import { CotractingController } from './cotracting.controller';

@Module({
  controllers: [CotractingController],
  providers: [CotractingService],
})
export class CotractingModule { }
