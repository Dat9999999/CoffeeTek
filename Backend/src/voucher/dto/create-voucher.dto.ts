import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateVoucherDto {
    @IsNotEmpty()
    quantity: number;

    @IsOptional()
    @IsString()
    voucherName?: string; // Tên hiển thị (VD: Voucher Tết)

    @IsOptional()
    @IsString()
    groupName?: string; // Tên nhóm (VD: TET_2025)

    @IsOptional()
    @IsString()
    prefix?: string; // Tiền tố code (VD: TET)

    @IsNotEmpty()
    discountRate: number;

    @IsNotEmpty()
    @Type(() => Date)
    validFrom: Date; // Đổi sang Date để transform đúng

    @IsNotEmpty()
    @Type(() => Date)
    validTo: Date;

    @IsNotEmpty()
    minAmountOrder: number;

    @IsNotEmpty()
    @IsNumber()
    requirePoint: number;
}