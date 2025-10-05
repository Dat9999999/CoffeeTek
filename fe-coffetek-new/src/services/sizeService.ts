import { Size } from "@/interfaces";
import api from "@/lib/api"
// using axios for API calls

export const sizeService = {
    async getAll(params?: { page?: number; size?: number; search?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/sizes", { params })
        return res.data
    },

    async getById(id: number) {
        const res = await api.get(`/sizes/${id}`)
        return res.data
    },

    async create(data: { name: string }) {
        const res = await api.post("/sizes", data)
        return res.data
    },

    async update(id: number, data: { name: string }) {
        const res = await api.put(`/sizes/${id}`, data)
        return res.data
    },

    async delete(id: number) {
        const res = await api.delete(`/sizes/${id}`)
        return res.data
    },
}
