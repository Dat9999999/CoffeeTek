import { Topping } from "./types";


export interface ToppingResponsePaging {
    data: Topping[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
