import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OrderStatus } from "src/common/enums/orderStatus.enum";

export class UpdateOrderStatusDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @IsString()
    @IsEnum(OrderStatus)
    status: OrderStatus

}
