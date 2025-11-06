// services/loyalLevelService.ts
import api from "@/lib/api"

export const loyalLevelService = {
    async getAll(params?: { page?: number; size?: number; search?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/loyal-level", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/loyal-level/${id}`);
        return res.data;
    },

    async create(data: { name: string; requirePoint: number }) {
        const res = await api.post("/loyal-level", data);
        return res.data;
    },

    async update(id: number, data: { name?: string; requirePoint?: number }) {
        const res = await api.put(`/loyal-level/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/loyal-level/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/loyal-level", { data: { ids } });
        return res.data;
    },
};
