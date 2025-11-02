import { Module } from '@nestjs/common';
import { MaterialLossService } from './material-loss.service';
import { MaterialLossController } from './material-loss.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialLossController],
  providers: [MaterialLossService],
})
export class MaterialLossModule { }
