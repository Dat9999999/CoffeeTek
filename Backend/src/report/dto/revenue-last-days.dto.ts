import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class RevenueLastDaysDto {
    @IsInt({ message: 'Số ngày phải là một số nguyên' })
    @IsPositive({ message: 'Số ngày phải là một số dương' })
    @Type(() => Number) // Tự động chuyển query param (string) sang number
    days: number;
}