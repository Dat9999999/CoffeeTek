import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class PaymentDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @Type(() => Number)
    amount: number;

    @IsNotEmpty()
    @Type(() => Number)
    recharge: number;
}