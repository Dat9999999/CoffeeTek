import { Type } from 'class-transformer';
import { IsInt, IsPositive, Min, Max } from 'class-validator';

export class RevenueByMonthDto {
    @IsInt()
    @IsPositive()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month: number;

    @IsInt()
    @IsPositive()
    @Min(2000) // Bạn có thể đặt năm tối thiểu theo nghiệp vụ
    @Type(() => Number)
    year: number;
}