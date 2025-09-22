import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { OrderDirection } from 'src/common/enums/order.enum';



export class GetAllProductsDto {
    @Type(() => Number)
    @Min(1)
    page = 1;

    @Type(() => Number)
    @Min(1)
    size = 10;

    @IsOptional()
    search?: string;

    @IsOptional()
    orderBy?: string = 'name';

    @IsEnum(OrderDirection)
    @IsOptional()
    orderDirection?: OrderDirection = OrderDirection.ASC;
}
