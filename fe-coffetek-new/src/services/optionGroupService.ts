import api from "@/lib/api";


export const optionGroupService = {
    async getAll(params?: { page?: number; size?: number; search?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/option-groups", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/option-groups/${id}`);
        return res.data;
    },

    async create(data: { name: string }) {
        const res = await api.post("/option-groups", data);
        return res.data;
    },

    async update(id: number, data: { name?: string }) {
        const res = await api.put(`/option-groups/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/option-groups/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/option-groups", { data: { ids } });
        return res.data;
    },
}