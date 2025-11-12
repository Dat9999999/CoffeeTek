import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, Min } from "class-validator";
import { Order, OrderDirection } from "../enums/order.enum";

export class GetAllDto {
    @Type(() => Number)
    @Min(1, { message: 'Page must be at least 1' })
    page: number;

    @Type(() => Number)
    @Min(1, { message: 'Size must be at least 1' })
    size: number;

    @IsOptional()
    searchName?: string;

    @IsString()
    orderBy?: string = 'id';

    @IsEnum(OrderDirection)
    @IsOptional()
    orderDirection?: OrderDirection = OrderDirection.ASC;
}

export class ResponseGetAllDto<T> {
    data: T[];
    meta: {
        total: number,
        page: number,
        size: number,
        totalPages: number
    }
}
