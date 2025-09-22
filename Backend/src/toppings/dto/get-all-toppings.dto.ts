import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { OrderDirection } from 'src/common/enums/order.enum';



export class GetAllToppingsDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    size: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    orderBy: string = 'id';

    @IsOptional()
    @IsEnum(OrderDirection)
    orderDirection: OrderDirection = OrderDirection.ASC;
}
