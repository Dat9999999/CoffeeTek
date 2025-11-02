
import { OptionGroup, OptionValue, Product, Size, Topping } from "./types";

export interface ProductPosItem {
    posItemId: string;
    product: Product;
    toppings?: {
        topping: Topping;
        toppingQuantity: number;
    }[];
    optionsSelected?: {
        optionGroup: OptionGroup;
        optionValue: OptionValue;
    }[];
    size?: Size;
    quantity: number;
}


export interface GetAllProductResponse {
    data: Product[];
    meta: {
        meta: {
            total: number,
            page: number,
            size: number,
            totalPages: number
        }
    }
}





export interface ProductDetail extends Product {

}



//
// input DTOs
//
export interface ProductSizeInput {
    id: number;
    price: number;
}

export interface ProductImageInput {
    image_name: string;
    sort_index: number;
}

export interface CreateProductDto {
    name: string;
    is_multi_size: boolean;
    product_detail?: string;
    price?: number;
    categoryId?: number | null;
    sizeIds?: ProductSizeInput[];
    optionValueIds?: number[];
    toppingIds?: number[];
    images?: ProductImageInput[];
    isTopping?: boolean
}

export interface UpdateProductDto {
    name?: string;
    is_multi_size?: boolean;
    product_detail?: string;
    price?: number;
    categoryId?: number | null;
    sizeIds?: ProductSizeInput[];
    optionValueIds?: number[];
    toppingIds?: number[];
    images?: ProductImageInput[];
}