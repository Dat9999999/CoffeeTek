import { MaterialRemain } from "@/interfaces";
import api from "@/lib/api";

export interface MaterialRemainSystemRecord {
    record: number;
    materialId: number;
    materialName: string;
    materialUnit: string;
    lastRemainQuantity: number;
}

export const inventoryService = {
    async getByMaterialId(materialId: number) {
        const res = await api.get<MaterialRemain[]>(`/material-remain/materials/${materialId}`);
        return res.data;
    },

    async getSystemTracking(date: Date) {
        const res = await api.get(`/material-remain/system-record`, {
            params: { date: date.toISOString() },
        });
        return res.data;
    },

    async update(id: number, data: { materialId: number; remain: number; date: Date }) {
        const res = await api.put(`/material-remain/${id}`, {
            ...data,
            date: data.date.toISOString(),
        });
        return res.data;
    },
};

