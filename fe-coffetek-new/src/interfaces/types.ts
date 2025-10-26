// types.ts
import type { UploadFile } from "antd";
import { OptionValue } from "./OptionValue";
import { GenderEnum } from "@/enum";
import { is } from "date-fns/locale";
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
    first_name: string,
    last_name: string,
    is_locked: boolean,
    detail?: UserDetail;
    roles?: Role[];
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