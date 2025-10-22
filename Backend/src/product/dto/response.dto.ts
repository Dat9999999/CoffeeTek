import {
  Category,
  ProductImage,
  ProductSize,
  Size,
  OptionValue,
} from '@prisma/client';

export interface ProductOptionValueGroup {
  id: number;
  name: string;
  values: OptionValue[];
}

interface Topping {
  id: number;
  price: number;
  image_name: string | null;
  sort_index: number;
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
  sizes: (Pick<ProductSize, 'price'> & { size: Size })[];
  toppings: Topping[];
  optionGroups: ProductOptionValueGroup[];
}
