import { Size } from "./types";



export interface SizeResponsePaging {
    data: Size[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}