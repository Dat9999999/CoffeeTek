import { IsNotEmpty, IsNumber } from "class-validator";

export class PromotionItemDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    newPrice: number;
}