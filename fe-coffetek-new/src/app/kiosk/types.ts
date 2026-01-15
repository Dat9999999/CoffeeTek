// --- PHẦN RESPONSE TỪ BACKEND (/products/pos) ---

export interface Size {
  id: number; // ID bảng ProductSize
  price: number;
  old_price?: number;
  size: {
    id: number; // ID bảng Size gốc
    name: string;
  };
}

export interface Topping {
  id: number;
  name: string;
  price: number;
  image_name?: string | null;
}

export interface OptionValue {
  id: number;
  name: string;
}

export interface OptionGroup {
  id: number;
  name: string;
  values: OptionValue[];
}

export interface Category {
  id: number;
  name: string;
  is_parent_category: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number; // Giá base
  old_price?: number;
  is_multi_size: boolean;
  isActive?: boolean;
  product_detail?: string;
  categoryId?: number; // Bổ sung trường này
  images: { image_name: string; sort_index: number }[];
  
  // Dữ liệu quan hệ
  sizes: Size[];
  toppings: Topping[];
  optionGroups: OptionGroup[];
}

// --- PHẦN GIỎ HÀNG (FRONTEND ONLY) ---

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedSize?: Size;
  selectedToppings: Topping[];
  selectedOptions: Record<number, number>;
  totalPrice: number;
  note?: string;
}

export interface OrderDetailItemDTO {
  productId: string; // Backend parseToInt
  quantity: string;
  sizeId?: string;
  note?: string;
  toppingItems?: {
    toppingId: string;
    quantity: string;
  }[];
  optionId: string[]; // Backend expects optionId (not optionValue)
}

export interface CreateOrderPayload {
  order_details: OrderDetailItemDTO[];
  customerPhone?: string;
  staffId: string; // QUAN TRỌNG: Backend bắt buộc
  note?: string;
}