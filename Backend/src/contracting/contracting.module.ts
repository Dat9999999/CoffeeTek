import { Module } from '@nestjs/common';
import { ContractingService } from './contracting.service';
import { ContractingController } from './contracting.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContractingController],
  providers: [ContractingService],
  exports: [ContractingService],
})
export class ContractingModule {}

