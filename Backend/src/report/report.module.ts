import { Module } from '@nestjs/common';
import { ReportsController } from './report.controller';
import { ReportsService } from './report.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportModule { }
