import { Size } from "@/interfaces";
import api from "@/lib/api"
// using axios for API calls

export const sizeService = {
    async getAll(params?: { page?: number; size?: number; search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/sizes", { params })
        return res.data
    },

    async getById(id: number) {
        const res = await api.get(`/sizes/${id}`)
        return res.data
    },

    async create(data: Omit<Size, "id">) {
        const res = await api.post("/sizes", data)
        return res.data
    },

    async update(id: number, data: Partial<Size>) {
        const res = await api.put(`/sizes/${id}`, data)
        return res.data
    },

    async remove(id: number) {
        const res = await api.delete(`/sizes/${id}`)
        return res.data
    },
}
