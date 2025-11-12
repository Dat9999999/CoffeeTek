import { CreateProductDto, PaginatedResponse, Product, ProductSize, UpdateProductDto } from "@/interfaces";
import api from "@/lib/api";

export interface GetAllProductsParams {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    isTopping?: boolean;
}

export interface PosProductSize extends ProductSize {
    old_price?: number;
}

/**
 * @description Kế thừa 'Product' cho API POS
 * - Thêm 'old_price' cho sản phẩm 1 size
 * - Ghi đè 'sizes' để sử dụng 'PosProductSize' (có old_price)
 * - 'toppings' được kế thừa tự động và vẫn giữ kiểu 'Topping[]' (không có old_price)
 */
export interface PosProduct extends Product {
    old_price?: number | null;
    sizes?: PosProductSize[]; // Ghi đè kiểu 'sizes'
}

/**
 * @description Kiểu trả về đầy đủ cho API /products/pos
 */
export type PosProductResponse = PaginatedResponse<PosProduct>;

export const productService = {
    // Lấy danh sách có phân trang + filter
    async getAll(params?: GetAllProductsParams) {
        const res = await api.get("/products", { params });
        return res.data;
    },

    // Lấy chi tiết sản phẩm theo id
    async getById(id: number) {
        const res = await api.get(`/products/${id}`);
        return res.data;
    },

    // Tạo sản phẩm mới
    async create(data: CreateProductDto) {
        const res = await api.post("/products", data);
        return res.data;
    },

    // Cập nhật sản phẩm
    async update(id: number, data: UpdateProductDto) {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    },

    // Xoá sản phẩm
    async delete(id: number) {
        const res = await api.delete(`/products/${id}`);
        return res.data;
    },

    async getAllPos(params?: GetAllProductsParams): Promise<PosProductResponse> {
        const res = await api.get("/products/pos", { params });
        return res.data;
    },
};
