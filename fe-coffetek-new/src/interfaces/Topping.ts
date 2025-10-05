export interface Topping {
    id: number;
    name: string;
    price: number;
    image_name?: string;
    sort_index: number;
    created_at: string;
    updated_at: string;
}

export interface ToppingResponsePaging {
    data: Topping[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
