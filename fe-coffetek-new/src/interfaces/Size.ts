export type Size = {
    id: number
    name: string
    sort_index: number
}


export interface SizeResponse {
    data: Size[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}