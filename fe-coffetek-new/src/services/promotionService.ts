import { PromotionItem } from "@/interfaces"
import api from "@/lib/api"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://coffeetek-production.up.railway.app/api"

// Define CreatePromotion interface based on CreatePromotionDto
interface CreatePromotion {
  name: string
  description: string
  startDate: string
  endDate: string
  items: PromotionItem[]
}

// Define UpdatePromotion interface based on UpdatePromotionDto (partial fields)
interface UpdatePromotion {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  items?: PromotionItem[]
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

  // ✅ Xóa nhiều khuyến mãi
  async deleteMany(ids: number[]) {
    const res = await api.delete("/promotion", { data: { ids } })
    return res.data
  },
}
