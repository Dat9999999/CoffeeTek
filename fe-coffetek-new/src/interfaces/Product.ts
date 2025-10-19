import { Category } from "./Category";
import { OptionGroup } from "./OptionGroup";
import { Size } from "./Size";
import { Topping } from "./Topping";

export interface ProductSize {
    id: number;
    product_id: number;
    size_id: number;
    price: number;
    size?: Size;
}

export interface ProductOptionValue {
    id: number;
    product_id: number;
    option_value_id: number;
}

export interface ProductTopping {
    id: number;
    product_id: number;
    topping_id: number;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_name: string;
    sort_index: number;
}


export interface Product {
    id: number;
    name: string;
    is_multi_size: boolean;
    product_detail?: string | null;
    price?: number | null;
    category_id?: number | null;

    sizes?: ProductSize[];
    optionGroups?: OptionGroup[];
    toppings?: Topping[];
    images?: ProductImage[];
    category?: Category | null;
}


export interface ProductDetail {
    id: number;
    name: string;
    is_multi_size: boolean;
    product_detail?: string | null;
    price?: number | null;
    category_id?: number | null;

    sizes?: ProductSize[];
    optionGroups?: OptionGroup[];
    toppings?: Topping[];
    images?: ProductImage[];
    category?: Category | null;
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