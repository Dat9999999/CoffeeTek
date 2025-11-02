import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateVoucherDto {
    @IsNotEmpty()
    quantity: number;
    @IsNotEmpty()
    discountRate: number;
    @IsNotEmpty()
    @Type(() => Date)
    validFrom: string;
    @IsNotEmpty()
    @Type(() => Date)
    validTo: string;
    @IsNotEmpty()
    minAmountOrder: number;

    @IsNotEmpty()
    @IsNumber()
    requirePoint: number;
}
