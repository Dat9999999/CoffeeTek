// types/product.ts
import { Category, ProductImage, ProductSize, Size, Topping, OptionValue, ProductOptionValue } from "@prisma/client";

export interface ProductOptionValueGroup {
    id: number;
    name: string;
    values: OptionValue[];
}

export interface ProductDetailResponse {
    id: number;
    name: string;
    is_multi_size: boolean;
    product_detail: string | null;
    price: number | null;
    category_id: number | null;
    category: Category | null;
    images: ProductImage[];
    sizes: (Pick<ProductSize, "price"> & { size: Size })[];
    toppings: Topping[];
    optionGroups: ProductOptionValueGroup[];
}
