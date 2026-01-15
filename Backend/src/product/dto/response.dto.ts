import {
  Category,
  OptionValue,
  ProductImage,
  ProductSize,
  Size,
} from '@prisma/client';

export interface ProductOptionValueGroup {
  id: number;
  name: string;
  values: OptionValue[];
}

interface Topping {
  id: number;
  name: string;
  price: number;
  image_name: string | null;
  sort_index: number;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  is_multi_size: boolean;
  product_detail: string | null;
  isTopping: boolean;
  isActive: boolean;
  price: number | null;
  category_id: number | null;
  category: Category | null;
  images: ProductImage[];
  sizes: (Pick<ProductSize, 'id' | 'price'> & { size: Size })[];
  toppings: Topping[];
  optionGroups: ProductOptionValueGroup[];
}

// 2. Interface ProductSizeResponse (gốc - không đổi)
export interface ProductSizeResponse {
  id: number;
  price: number;
  size: Size;
}

export interface PosProductSizeResponse extends ProductSizeResponse {
  old_price?: number;
}

// ✅ Kế thừa ProductDetailResponse
export interface PosProductDetailResponse extends ProductDetailResponse {
  old_price?: number | null;
  sizes: PosProductSizeResponse[];
}