import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class PaymentDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @Type(() => Number)
    amount: number;

    @Type(() => Number)
    change?: number;
}