import { CreateProductDto, UpdateProductDto } from "@/interfaces";
import api from "@/lib/api";

export interface GetAllProductsParams {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}

export const productService = {
    // ✅ Lấy danh sách có phân trang + filter
    async getAll(params?: GetAllProductsParams) {
        const res = await api.get("/products", { params });
        return res.data;
    },

    // ✅ Lấy chi tiết sản phẩm theo id
    async getById(id: number) {
        const res = await api.get(`/products/${id}`);
        return res.data;
    },

    // ✅ Tạo sản phẩm mới
    async create(data: CreateProductDto) {
        const res = await api.post("/products", data);
        return res.data;
    },

    // ✅ Cập nhật sản phẩm
    async update(id: number, data: UpdateProductDto) {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    },

    // ✅ Xoá sản phẩm
    async delete(id: number) {
        const res = await api.delete(`/products/${id}`);
        return res.data;
    },
};
