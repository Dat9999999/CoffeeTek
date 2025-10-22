import { Type } from "class-transformer";
import { createToppingItemDTO } from "./create-topping-item.dto";
import { IsNotEmpty, IsOptional } from "class-validator";

export class orderItemDTO {
    @Type(() => Number)
    @IsNotEmpty()
    productId: string;
    @Type(() => Number)
    @IsNotEmpty()
    quantity: string;
    toppingItems?: createToppingItemDTO[];
    sizeId?: string;
    @IsOptional()
    optionId: string[];
}