import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum TimeUnit {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

export class ReportQueryDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsEnum(TimeUnit)
    timeUnit: TimeUnit = TimeUnit.DAY;
}