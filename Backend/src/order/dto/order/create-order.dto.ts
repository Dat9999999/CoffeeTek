import { IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";
import { orderItemDTO } from "./item-order.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
    //list produtc & quantity
    @IsNotEmpty()
    order_details: orderItemDTO[];

    @IsOptional()
    @IsPhoneNumber('VN')
    customerPhone?: string
    // voucherId?: number
    @Type(() => Number)
    @IsNotEmpty()
    staffId: string
    note?: string





}
