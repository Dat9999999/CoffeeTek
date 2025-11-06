import { PaginatedResponse, WastageLog } from "@/interfaces";
import api from "@/lib/api";

// all date: ISO string


export interface CreateWastageLogDto {
    materialId: number;
    quantity: number;
    reason: string;
    date: string;
}

export interface UpdateWastageLogDto extends CreateWastageLogDto {
    id?: number;
}

export const wastageLogService = {
    /** 🔹 Lấy tất cả wastage logs (phân trang + tìm kiếm) */
    async getAll(params?: {
        page?: number;
        size?: number;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
        searchName?: string;
        date?: string;
    }) {
        const res = await api.get<PaginatedResponse<WastageLog>>("/material-loss", { params });
        return res.data;
    },

    /** 🔹 Lấy chi tiết 1 wastage log */
    async getById(id: number) {
        const res = await api.get<WastageLog>(`/material-loss/${id}`);
        return res.data;
    },

    /** 🔹 Tạo mới wastage log */
    async create(data: CreateWastageLogDto) {
        const res = await api.post<WastageLog>("/material-loss", data);
        return res.data;
    },

    /** 🔹 Cập nhật wastage log */
    async update(id: number, data: UpdateWastageLogDto) {
        const res = await api.put<WastageLog>(`/material-loss/${id}`, data);
        return res.data;
    },

    /** 🔹 Xóa 1 wastage log */
    async remove(id: number) {
        const res = await api.delete<{ message: string }>(`/material-loss/${id}`);
        return res.data;
    },

    /** 🔹 Xóa nhiều wastage log cùng lúc */
    async removeMany(ids: number[]) {
        const res = await api.delete<{ message: string; count: number }>("/material-loss", {
            data: { ids },
        });
        return res.data;
    },
};
