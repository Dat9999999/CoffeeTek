import { Module } from '@nestjs/common';
import { MaterialRemainService } from './material-remain.service';
import { MaterialRemainController } from './material-remain.controller';

@Module({
  controllers: [MaterialRemainController],
  providers: [MaterialRemainService],
})
export class MaterialRemainModule {}
