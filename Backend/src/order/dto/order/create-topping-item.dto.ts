import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class createToppingItemDTO {
    @Type(() => Number)
    @IsNotEmpty()
    toppingId: string;
    quantity: string;
}