import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class PaymentDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @Type(() => Number)
    amount: number;

    @IsOptional()
    @Type(() => Number)
    change: number;
}