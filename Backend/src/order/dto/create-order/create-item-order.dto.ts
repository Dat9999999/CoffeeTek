import { createToppingItemDTO } from "./create-topping-item.dto";

export class orderItemDTO {
    productId: number;
    quantity: number;
    toppingItems?: createToppingItemDTO[];
    sizeId?: number;
}