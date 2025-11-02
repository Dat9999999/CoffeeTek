import api from "@/lib/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://coffeetek-production.up.railway.app/api"

export const promotionService = {
  async getAll(page = 1, size = 10) {
    const res = await fetch(`${BASE_URL}/promotion?page=${page}&size=${size}`)
    if (!res.ok) throw new Error("Failed to fetch promotions")
    const json = await res.json()
    return json.data || [] // dữ liệu nằm trong "data"
  },
  async getById(id: number) {
    const res = await api.get(`/promotion/${id}`)
    return res.data
  }
}
