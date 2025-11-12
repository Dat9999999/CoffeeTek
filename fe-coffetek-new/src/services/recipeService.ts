import { Material, Size, Unit } from "@/interfaces";
import api from "@/lib/api";


export interface MaterialRecipeItem {
    id: number;
    consume: number;
    recipeId: number;
    materialId: number;
    sizeId: number | null;
    Material: {
        id: number;
        name: string;
        remain: number;
        code: string;
        Unit: Unit;
    };
    Size: Size | null;
}

export interface RecipeByProductId {
    id: number;
    product_id: number;
    Product: {
        id: number;
        name: string;
        is_multi_size: boolean;
        product_detail?: string | null;
        price?: number | null;
        isActive: boolean;
        isTopping: boolean;
        category_id?: number | null;
    };
    MaterialRecipe: MaterialRecipeItem[];
}

interface RecipeItem {
    material: Material;
    consume: {
        sizeId: number | null;
        amount: number;
    }[];
}

export interface CreateRecipeDto {
    productId: string;
    sizeId: number | null;
    materials: {
        materialId: string;
        consume: string;
    }[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> { }

/**
 * Maps an array of RecipeItem to the CreateRecipeDto structure for a specific product and size.
 * Assumes Material has an 'id' property that can be converted to string.
 * Throws an error if no consume amount is found for the given sizeId (or null as fallback).
 * @param productId The ID of the product.
 * @param sizeId The ID of the size (can be null if using default consumes).
 * @param items The array of RecipeItem to map.
 * @returns The mapped CreateRecipeDto.
 */
export function mapRecipeItemsToDto(
    productId: string,
    sizeId: number | null,
    items: RecipeItem[]
): CreateRecipeDto {

    return {
        productId,
        sizeId: sizeId,
        materials: items.map(item => {
            const consumeEntry =
                item.consume.find(c => c.sizeId === sizeId) || // match sizeId cụ thể
                item.consume.find(c => c.sizeId === null);    // fallback default
            if (!consumeEntry) {
                throw new Error(`No consume found for sizeId ${sizeId} in material ${item.material.id}`);
            }
            return {
                materialId: item.material.id.toString(),
                consume: consumeEntry.amount.toString(),
            };
        }),
    };
}



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

    async getByProductId(id: number) {
        const res = await api.get(`/recipe/product/${id}`);
        return res.data as RecipeByProductId;
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