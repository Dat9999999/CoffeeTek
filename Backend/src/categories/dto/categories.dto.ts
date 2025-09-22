import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
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
    orderBy: string = 'name'; // cột muốn sort (name, sort_index,...)

    @IsOptional()
    @IsEnum(OrderDirection, { message: "orderDirection must be 'asc' or 'desc'" })
    orderDirection: OrderDirection = OrderDirection.ASC;
}
