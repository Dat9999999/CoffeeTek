
import api from "@/lib/api"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://coffeetek-production.up.railway.app/api"

export const voucherService = {
  // ✅ Lấy danh sách voucher
  async getAll(params?: {
    page?: number
    size?: number
    searchName?: string
    orderBy?: string
    orderDirection?: "asc" | "desc"
  }) {
    const res = await api.get("/voucher", { params })
    return res.data
  },

  // ✅ Lấy voucher theo mã
  async getByCode(code: string) {
    const res = await api.get(`/voucher/${code}`)
    return res.data
  },

  // ✅ Tạo voucher mới
  async create(data: {
    quantity: number
    discountRate: number
    validFrom: string
    validTo: string
    minAmountOrder: number
    requirePoint: number
  }) {
    const res = await api.post("/voucher", data)
    return res.data
  },

  // ✅ Lưu voucher về tài khoản khách hàng (PUT /voucher?id=...)
  async exchange(id: number, customerPhone: string) {
    try {
      const res = await api.put(`/voucher?id=${id}`, { customerPhone })
      return res.data
    } catch (error: any) {
      console.error("❌ Exchange voucher failed:", error.response?.data || error)
      throw new Error("Exchange voucher failed")
    }
  },

  // ✅ Xóa nhiều voucher
  async deleteMany(ids: number[]) {
    const res = await api.delete("/voucher", { data: { voucherIds: ids } })
    return res.data
  },

  // ✅ Xóa 1 voucher
  async delete(id: number) {
    const res = await api.delete("/voucher", { data: { voucherIds: [id] } })
    return res.data
  },
}
