import { Type } from "class-transformer";
import { IsEnum, IsOptional, Min } from "class-validator";
import { Order } from "../enums/order.enum";

export class GetAllDto {
    @Type(() => Number)
    @Min(1, { message: 'Page must be at least 1' })
    page: number;

    @Type(() => Number)
    @Min(1, { message: 'Size must be at least 1' })
    size: number;

    @IsOptional()
    searchName?: string;

    @IsEnum(Order, { message: "orderBy must be 'asc' or 'desc'" })
    orderBy?: Order = Order.ASC;
}