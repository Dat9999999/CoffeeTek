import { IsNotEmpty, IsPhoneNumber } from "class-validator";
import { orderItemDTO } from "./create-item-order.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
    //list produtc & quantity
    @IsNotEmpty()
    orderItems: orderItemDTO[];

    @IsPhoneNumber('VN')
    customerPhone?: string
    // voucherId?: number
    @Type(() => Number)
    @IsNotEmpty()
    staffId: number
    notes?: string

    // paymentMethod: 'CASH' | 'CARD' | 'MOMO'

}
