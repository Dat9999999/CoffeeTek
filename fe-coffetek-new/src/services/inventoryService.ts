import { MaterialRemain } from "@/interfaces";
import api from "@/lib/api";

export const inventoryService = {
    async getByMaterialId(materialId: number) {
        const res = await api.get<MaterialRemain[]>(`/material-remain/materials/${materialId}`);
        return res.data;
    },
};
