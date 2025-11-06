import { Category } from "./types";


export interface CategoryResponsePaging {
    data: Category[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

export interface CategoryDetail {
    id: number;
    name: string;
    sort_index: number;
    is_parent_category: boolean;
    parent_category_id?: number | null;
    parent_category?: Category;
    subcategories?: Category[];
}