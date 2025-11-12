import { Type } from 'class-transformer';
import { IsInt, IsPositive, Min } from 'class-validator';

export class RevenueByYearDto {
    @IsInt({ message: 'Năm phải là một số nguyên' })
    @IsPositive({ message: 'Năm phải là số dương' })
    @Min(2000, { message: 'Năm phải lớn hơn hoặc bằng 2000' })
    @Type(() => Number)
    year: number;
}