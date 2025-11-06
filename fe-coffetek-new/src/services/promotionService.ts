import api from "@/lib/api"; // Using axios for API calls

// Define CreatePromotion interface based on CreatePromotionDto
interface CreatePromotion {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  items: PromotionItemDto[];
}

// Define PromotionItemDto interface to create/update promotion
export interface PromotionItemDto {
  productId: number;
  newPrice: number;
  productSizedId: number | null; // Nullable to accommodate is_multi_size=false hoặc isTopping=true products
}


// Define UpdatePromotion interface based on UpdatePromotionDto (partial fields)
interface UpdatePromotion {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  items?: PromotionItemDto[];
}

export const promotionService = {
  // ✅ Lấy danh sách khuyến mãi (cho cả FE public & admin)
  async getAll(params?: {
    page?: number
    size?: number
    search?: string
    orderBy?: string
    orderDirection?: "asc" | "desc"
  }) {
    const res = await api.get("/promotion", { params })
    return res.data
  },

  // ✅ Lấy chi tiết khuyến mãi
  async getById(id: number) {
    const res = await api.get(`/promotion/${id}`)
    return res.data
  },

  // ✅ Tạo mới khuyến mãi
  async create(data: CreatePromotion) {
    const res = await api.post("/promotion", data)
    return res.data
  },

  // ✅ Cập nhật khuyến mãi
  async update(id: number, data: UpdatePromotion) {
    const res = await api.put(`/promotion/${id}`, data)
    return res.data
  },

  // ✅ Xóa khuyến mãi đơn
  async delete(id: number) {
    const res = await api.delete(`/promotion/${id}`)
    return res.data
  },

  async deleteMany(ids: number[]) {
    const res = await api.delete("/promotion", { data: { ids } });
    return res.data;
  },

  /** ✅ Toggle active state of a promotion */
  async toggleActive(id: number, isActive: boolean) {
    const res = await api.patch(`/promotion/${id}/active`, { isActive });
    return res.data;
  },
};
