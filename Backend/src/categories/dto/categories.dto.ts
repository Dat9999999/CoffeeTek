import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderDirection } from 'src/common/enums/order.enum';

export class GetAllCategoriesDto {
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Page must be at least 1' })
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Size must be at least 1' })
    size: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    orderBy: string = 'id';

    @IsOptional()
    @IsEnum(OrderDirection, { message: "orderDirection must be 'asc' or 'desc'" })
    orderDirection: OrderDirection = OrderDirection.ASC;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    isParentCategory?: boolean;
}
