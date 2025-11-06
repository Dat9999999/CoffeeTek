import { Module } from '@nestjs/common';
import { ReportsController } from './report.controller';
import { ReportsService } from './report.service';


@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportModule { }
