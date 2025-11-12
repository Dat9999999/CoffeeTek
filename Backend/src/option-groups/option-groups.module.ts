import { Module } from '@nestjs/common';
import { OptionGroupsService } from './option-groups.service';
import { OptionGroupsController } from './option-groups.controller';

@Module({
  providers: [OptionGroupsService],
  controllers: [OptionGroupsController]
})
export class OptionGroupsModule {}
