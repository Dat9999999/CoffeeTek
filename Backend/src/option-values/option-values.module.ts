import { Module } from '@nestjs/common';
import { OptionValuesService } from './option-values.service';
import { OptionValuesController } from './option-values.controller';

@Module({
  providers: [OptionValuesService],
  controllers: [OptionValuesController]
})
export class OptionValuesModule {}
