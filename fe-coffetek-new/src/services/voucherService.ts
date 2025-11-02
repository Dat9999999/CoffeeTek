const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://coffeetek-production.up.railway.app/api"

export const voucherService = {
  async getAll(page = 1, size = 10) {
    const res = await fetch(`${BASE_URL}/voucher?page=${page}&size=${size}`)
    if (!res.ok) throw new Error("Failed to fetch vouchers")
    const json = await res.json()
    return json.content || json.data || [] // hỗ trợ cả hai kiểu
  },

  async exchange(promotionId: number, customerPhone: string) {
    // Gọi đúng API: PUT /voucher?id={promotionId}
    const res = await fetch(`${BASE_URL}/voucher?id=${promotionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerPhone }),
    })

    if (!res.ok) {
      const errMsg = await res.text()
      console.error("Exchange voucher failed:", errMsg)
      throw new Error("Exchange voucher failed")
    }

    return await res.json()
  },
}
