import { Module } from '@nestjs/common';
import { LoyalLevelService } from './loyal-level.service';
import { LoyalLevelController } from './loyal-level.controller';

@Module({
  controllers: [LoyalLevelController],
  providers: [LoyalLevelService],
})
export class LoyalLevelModule {}
