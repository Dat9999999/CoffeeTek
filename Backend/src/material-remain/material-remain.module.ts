import { Module } from '@nestjs/common';
import { MaterialRemainService } from './material-remain.service';
import { MaterialRemainController } from './material-remain.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialRemainController],
  providers: [MaterialRemainService],
})
export class MaterialRemainModule { }
