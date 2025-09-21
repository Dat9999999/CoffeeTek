import { Module } from '@nestjs/common';
import { SizesController } from './sizes.controller';
import { SizesService } from './sizes.service';

@Module({
  controllers: [SizesController],
  providers: [SizesService]
})
export class SizesModule {}
