import { Module } from '@nestjs/common';
import { LoyalLevelService } from './loyal-level.service';
import { LoyalLevelController } from './loyal-level.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LoyalLevelController],
  providers: [LoyalLevelService],
})
export class LoyalLevelModule { }
