import { Topping } from "@/interfaces";
import api from "@/lib/api";

export const toppingService = {
    async getAll(params?: {
        page?: number;
        size?: number;
        search?: string;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }): Promise<{
        data: Topping[];
        meta: {
            total: number;
            page: number;
            size: number;
            totalPages: number;
        };
    }> {
        const res = await api.get("/products", {
            params: { isTopping: true, ...params },
        });

        // Backend trả về dạng { data: ProductDetailResponse[], meta: {...} }
        const { data, meta } = res.data;

        const mappedData: Topping[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            image_name: p.images?.[0]?.image_name || null,
            sort_index: p.images?.[0]?.sort_index || 0,
        }));

        return { data: mappedData, meta };
    },

    async getById(id: number): Promise<Topping> {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        return {
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            image_name: p.images?.[0]?.image_name || null,
            sort_index: p.images?.[0]?.sort_index || 0,
        };
    },

    async create(data: { name: string; price: number; image_name?: string }) {
        const res = await api.post("/products", data);
        return res.data;
    },

    async update(id: number, data: { name?: string; price?: number; image_name?: string }) {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/products/${id}`);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/products", { data: { ids } });
        return res.data;
    },
}