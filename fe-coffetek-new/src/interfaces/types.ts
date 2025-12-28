// this is front-end file: @/interfaces/types.ts

import { GenderEnum } from "@/enum";

// Add these to types.ts

export enum NotificationType {
    ORDER = 'order',
    PROMOTION = 'promotion',
    ORDER_TASK = 'order_task',
    INVENTORY = 'inventory',
    SYSTEM = 'system'
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    userId: number;
    createdAt: string; // API trả về ISO string
}

export interface WastageLog {
    id: number;
    materialId: number;
    quantity: number;
    reason: string;
    date: string; // ISO string
    userId?: number | null;
    Mateterial?: Material; // chú ý backend đang dùng "Mateterial" (viết sai chính tả)
    User?: User | null;
}


export interface MaterialRemain {
    id: number;
    materialId: number;
    remain: number;
    date: string; // ISO string
    Material: Material;
}


export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPING = 'shipping',
    COMPLETED = 'completed',
    CANCELED = 'canceled',

}

export interface ToppingOrderDetail {
    id: number;
    quantity: number;
    unit_price: number;
    order_detail_id: number;
    topping_id: number;
    topping: Product; // Toppings are represented as Product objects with isTopping: true
}

export interface OrderDetail {
    id: number;
    quantity: number;
    unit_price: number;
    product_name: string;
    order_id: number;
    product_id: number;
    size_id: number | null;
    product: Product;
    size: Size | null;
    ToppingOrderDetail: ToppingOrderDetail[];
    optionValue: OptionValue[]; // OptionValue may include option_group as per JSON response
}

export interface Order {
    id: number;
    note: string;
    original_price: number;
    final_price: number;
    created_at: string;
    status: OrderStatus;
    customerPhone: string;
    staffId: number;
    paymentDetailId: number | null;
    invoiceUrl: string | null;
    order_details: OrderDetail[];
    Customer: User | null;
    Staff: User | null;
}

// Optional: Update existing OptionValue to support option_group from JSON
// If needed, extend OptionValue like this:
export interface OptionValue {
    id: number;
    name: string;
    sort_index: number;
    option_group_id: number;
    option_group?: OptionGroup; // Add this to match JSON structure
}

// export interface OptionValue {
//     id: number;
//     name: string;
//     sort_index: number;
//     option_group_id: number;
// }


export interface Promotion {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    ProductPromotion?: ProductPromotionItem[];
}

export interface ProductPromotionItem {
    id: number;
    productId: number;
    promotionId: number;
    new_price: number;
    productSizeId: number | null;
    Product: Product;
}


export interface Voucher {
    id: number; // ID của voucher, optional vì có thể không có khi tạo mới
    code: string; // Mã voucher, ví dụ: PROMO-ABCD-1234
    valid_from: string; // Ngày bắt đầu hiệu lực (ISO string)
    valid_to: string; // Ngày hết hiệu lực (ISO string)
    requirePoint: number; // Số điểm cần thiết để đổi voucher
    minAmountOrder: number; // Số tiền tối thiểu của đơn hàng để áp dụng voucher
    discount_percentage: number; // Tỷ lệ giảm giá (%)
    customerPhone?: string | null; // Số điện thoại của khách hàng đã đổi voucher, optional và có thể là null
    is_active: boolean; // Trạng thái hoạt động của voucher
    voucher_name: string; // Tên voucher
    group_name: string; // Tên nhóm voucher
}

export interface CustomerPoint {
    id: number;
    points: number;
    customerPhone: string;
    loyalLevelId: number;
}

export interface LoyalLevel {
    id: number;
    name: string;
    required_points: number;
}
export interface Unit {
    id: number;
    name: string;
    symbol: string;
    class: string;
}

export interface Material {
    id: number;
    name: string;
    remain: number;
    code: string;
    unit: Unit;
    Unit: Unit;
}

export interface Contracting {
    id: number;
    quantity: number;
    materialId: number;
    Material?: {
        id: number;
        name: string;
        code: string;
        unit?: {
            id: number;
            name: string;
            symbol: string;
        };
    };
    empoloyeeId?: number;
    User?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string | Date;
}

export interface Topping {
    id: number;
    name: string;
    price: number;
    image_name?: string;
    sort_index: number;
}

export interface User {
    id: number;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    is_locked: boolean;
    detail?: UserDetail;
    roles?: Role[];
    Voucher?: Voucher[]; // ✅ Thêm
    CustomerPoint?: CustomerPoint | null; // ✅ Thêm
}

export interface UserDetail {
    id: number;
    birthday: string;
    sex: GenderEnum;
    avatar_url: string;
    address: string;
    userId: number;
}

export interface Role {
    id: number;
    role_name: string;
}

export interface OptionGroup {
    id: number;
    name: string;
    values?: OptionValue[];
}

export interface Category {
    id: number;
    name: string;
    sort_index: number;
    is_parent_category: boolean;
    parent_category_id?: number | null;
    parent_category?: Category;
    subcategories?: Category[];
}

export interface ProductSize {
    id: number;
    price: number;
    size: Size;
}
export interface ProductImage {
    id: number;
    product_id: number;
    image_name: string;
    sort_index: number;
}

export type Size = {
    id: number
    name: string
    sort_index: number
}

export interface ProductOptionValueGroup {
    id: number;
    name: string;
    values: OptionValue[];
}

export interface Product {
    id: number;
    name: string;
    is_multi_size: boolean;
    product_detail?: string | null;
    price?: number | null;
    category_id?: number | null;
    isTopping?: boolean;
    sizes?: ProductSize[];
    optionGroups: ProductOptionValueGroup[];
    toppings?: Topping[];
    images?: ProductImage[];
    category?: Category | null;
}

/**
 * @description Metadata cho các API trả về có phân trang
 */
export interface PaginationMeta {
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

/**
 * @description Kiểu trả về chung cho các API get-all (có phân trang)
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}