import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetNotificationsDto {
    @IsOptional()
    @Type(() => Number) // Chuyển string query 'page=1' thành number 1
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number) // Chuyển string query 'size=10' thành number 10
    @IsInt()
    @Min(1)
    size?: number = 10;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isRead?: boolean;
}