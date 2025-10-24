import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

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
    requireLevelId: number;
    @IsNotEmpty()
    minAmountOrder: number;
}
