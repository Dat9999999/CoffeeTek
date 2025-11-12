import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class PromotionItemDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    newPrice: number;
    @IsOptional()
    productSizedId: number
}