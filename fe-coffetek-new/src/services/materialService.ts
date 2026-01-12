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

    /**
     * Get average cost per unit for a material based on importations
     * This calculates: (sum of pricePerUnit * importQuantity) / (sum of importQuantity)
     */
    async getMaterialAverageCost(materialId: number): Promise<number> {
        try {
            // Get material with importations
            const response = await api.get(`/material/${materialId}`);
            const material = response.data;
            
            // Debug: log the response structure
            if (process.env.NODE_ENV === 'development') {
                console.log(`Material ${materialId} response:`, material);
            }
            
            // Handle different possible response structures
            const importations = material?.MaterialImportation || material?.materialImportation || [];
            
            if (importations.length === 0) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Material ${materialId} has no importations`);
                }
                return 0;
            }

            const totalValue = importations.reduce(
                (sum: number, imp: any) => {
                    const price = imp.pricePerUnit || 0;
                    const quantity = imp.importQuantity || 0;
                    return sum + (price * quantity);
                },
                0
            );
            const totalQuantity = importations.reduce(
                (sum: number, imp: any) => sum + (imp.importQuantity || 0),
                0
            );

            const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
            
            if (process.env.NODE_ENV === 'development') {
                console.log(`Material ${materialId} average cost:`, averageCost);
            }
            
            return averageCost;
        } catch (error: any) {
            console.error(`Error calculating average cost for material ${materialId}:`, error);
            if (error.response) {
                console.error('Response error:', error.response.data);
            }
            return 0;
        }
    },

};
