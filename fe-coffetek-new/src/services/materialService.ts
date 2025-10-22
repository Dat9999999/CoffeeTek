import { Material, Unit } from "@/interfaces";
import api from "@/lib/api";


export const materialService = {
    async getAll() {
        const res = await api.get<Material[]>("/material");
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



    async create(data: { name: string; unitId: number }) {
        const res = await api.post("/material", data);
        return res.data;
    },

    async update(id: number, data: { name: string; unitId: number }) {
        const res = await api.put(`/material/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/material/${id}`);
        return res.data;
    },

    async importMaterial(data: { materialId: number; quantity: number; pricePerUnit: number }) {
        const res = await api.post("/material/import", data);
        return res.data;
    },

    async getAdjustmentHistory(params: {
        type: "import" | "consume";
        date: Date;
        materialId?: number;
        page?: number;
        size?: number;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }) {
        const res = await api.get("/material/adjustment-history", {
            params: {
                ...params,
                date: params.date.toISOString(),
            },
        });
        return res.data;
    },

    async confirmAdjustmentHistory(date: Date, items: { materailId: number; realisticRemain: number }[]) {
        const res = await api.put("/material/adjustment-history/confirm", { items }, {
            params: { date: date.toISOString() },
        });
        return res.data;
    },
};
