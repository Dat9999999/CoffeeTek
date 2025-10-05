import { IsNotEmpty } from "class-validator";

export class PaymentDTO {
    @IsNotEmpty()
    orderId: number;
    @IsNotEmpty()
    amount: number;
    @IsNotEmpty()
    recharge: number;
}