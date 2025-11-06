import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class PaymentDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsOptional()
    @Type(() => Number)
    amount: number;

    @IsOptional()
    voucherCode: string

    @IsOptional()
    @Type(() => Number)
    change: number;
}