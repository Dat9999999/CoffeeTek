import { PromotionItem } from "@/interfaces";
import api from "@/lib/api"; // Using axios for API calls

// Define CreatePromotion interface based on CreatePromotionDto
interface CreatePromotion {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    items: PromotionItem[];
}

// Define UpdatePromotion interface based on UpdatePromotionDto (partial fields)
interface UpdatePromotion {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    items?: PromotionItem[];
}

export const promotionService = {
    async getAll(params?: {
        page?: number;
        size?: number;
        search?: string;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }) {
        const res = await api.get("/promotion", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/promotion/${id}`);
        return res.data;
    },

    async create(data: CreatePromotion) {
        const res = await api.post("/promotion", data);
        return res.data;
    },

    async update(id: number, data: UpdatePromotion) {
        const res = await api.put(`/promotion/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/promotion/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/promotion", { data: { ids } });
        return res.data;
    },
};