import { Material, Unit } from "@/interfaces";
import api from "@/lib/api";


export const materialService = {
    async getAll(params?: { page?: number; size?: number; searchName?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' }) {
        const res = await api.get("/material", { params });
        return res.data;
    },

    async getAllUnit() {
        const res = await api.get<Unit[]>("/unit");
        return res.data;
    },

    async getUnitById(id: number) {
        const res = await api.get<Unit>(`/unit/${id}`);
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get<Material>(`/material/${id}`);
        return res.data;
    },



    async create(data: { name: string; unitId: number, code: string }) {
        const res = await api.post("/material", data);
        return res.data;
    },

    async update(id: number, data: { name: string; unitId: number, code: string }) {
        const res = await api.put(`/material/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/material/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/material", { data: { ids } });
        return res.data;
    },

    async importMaterial(data: { materialId: number; quantity: number; pricePerUnit: number }) {
        const res = await api.post("/material/import", data);
        return res.data;
    },


};
