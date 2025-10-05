import { Topping } from "@/interfaces";
import api from "@/lib/api";

export const toppingService = {
    async getAll(params?: { page?: number; size?: number; search?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/toppings", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/toppings/${id}`);
        return res.data;
    },

    async create(data: { name: string; price: number; image_name?: string }) {
        const res = await api.post("/toppings", data);
        return res.data;
    },

    async update(id: number, data: { name?: string; price?: number; image_name?: string }) {
        const res = await api.put(`/toppings/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/toppings/${id}`);
        return res.data;
    },
}