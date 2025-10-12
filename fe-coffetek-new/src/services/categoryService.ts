import api from "@/lib/api";

export interface GetAllCategoriesParams {
    page?: number;
    size?: number;
    search?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    isParentCategory?: boolean;
}

export const categoryService = {
    async getAll(params?: GetAllCategoriesParams) {
        const res = await api.get("/categories", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/categories/${id}`);
        return res.data;
    },

    async create(data: { name: string; is_parent_category: boolean; parent_category_id?: number }) {
        const res = await api.post("/categories", data);
        return res.data;
    },

    async update(id: number, data: { name?: string; is_parent_category?: boolean; parent_category_id?: number | null }) {
        const res = await api.put(`/categories/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/categories/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/categories", { data: { ids } });
        return res.data;
    }
};