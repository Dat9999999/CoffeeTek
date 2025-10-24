import api from "@/lib/api";

export interface CreateRecipeDto {
    productId: number;
    materials: {
        materialId: number;
        consume: number;
    }[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> { }

/**
 * Service quản lý recipe (công thức sản xuất)
 * Sử dụng axios instance `api` để gọi backend API NestJS (/recipe)
 */
export const recipeService = {
    async getAll() {
        const res = await api.get("/recipe");
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/recipe/${id}`);
        return res.data;
    },

    async create(data: CreateRecipeDto) {
        const res = await api.post("/recipe", data);
        return res.data;
    },

    async update(id: number, data: UpdateRecipeDto) {
        const res = await api.put(`/recipe/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/recipe/${id}`);
        return res.data;
    },
};
