import api from "@/lib/api";


export const optionValueService = {
    async getAll(params?: { page?: number; size?: number; search?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/option-values", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/option-values/${id}`);
        return res.data;
    },

    async create(data: { name: string, option_group_id: number, sort_index?: number }) {
        const res = await api.post("/option-values", data);
        return res.data;
    },

    async update(id: number, data: { name?: string, option_group_id?: number, sort_index?: number }) {
        const res = await api.put(`/option-values/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/option-values/${id}`);
        return res.data;
    },
}