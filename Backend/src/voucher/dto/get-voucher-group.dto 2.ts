import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetVoucherGroupDto {
    @IsOptional()
    @IsString()
    searchName?: string; // tìm kiếm theo group_name

    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    size?: number = 10;

    @IsOptional()
    @IsString()
    orderBy?: string = 'group_name';

    @IsOptional()
    @IsString()
    orderDirection?: 'asc' | 'desc' = 'asc';

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    onlyActive?: boolean; // nếu true chỉ lấy voucher active
}
