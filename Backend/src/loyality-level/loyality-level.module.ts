import { Module } from '@nestjs/common';
import { LoyalityLevelService } from './loyality-level.service';
import { LoyalityLevelController } from './loyality-level.controller';

@Module({
  controllers: [LoyalityLevelController],
  providers: [LoyalityLevelService],
})
export class LoyalityLevelModule {}
