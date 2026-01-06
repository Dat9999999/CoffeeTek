// services/voucherService.ts
import api from "@/lib/api"
import { Voucher, PaginatedResponse } from "@/interfaces/types"

export interface VoucherGroup {
  group_name: string;
  voucher_name?: string | null;

  /** phần trăm giảm giá (0–100) */
  discount_percentage?: number | null;

  /** Thời gian hiệu lực nhóm */
  valid_from?: string | null;
  valid_to?: string | null;

  /** Tổng số voucher trong group */
  total: number;

  /** Số voucher đang active */
  active: number;

  /** Số voucher inactive */
  inactive: number;
}


export const voucherService = {

  // ================================
  // 📌 Lấy danh sách voucher (admin)
  // ================================
  async getAll(params?: {
    page?: number;
    size?: number;
    searchName?: string;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    groupName?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Voucher>> {
    const res = await api.get("/voucher", { params });
    return res.data;
  },

  // ================================
  // 📌 Lấy voucher theo mã
  // ================================
  async getByCode(code: string): Promise<Voucher> {
    const res = await api.get(`/voucher/${code}`)
    return res.data
  },

  // ================================
  // 📌 Tạo voucher mới (admin)
  // ================================
  async create(data: {
    quantity: number
    discountRate: number
    validFrom: string
    validTo: string
    minAmountOrder: number
    requirePoint: number
    groupName?: string
    prefix?: string,
    voucherName: string,
  }) {
    const res = await api.post("/voucher", data)
    return res.data
  },

  // ============================================
  // 📌 User exchange voucher theo voucher ID
  // PUT /voucher?id=xxx
  // ============================================
  async exchange(id: number, customerPhone: string) {
    try {
      const res = await api.put(`/voucher?id=${id}`, { customerPhone })
      return res.data
    } catch (error: any) {
      console.error(" Exchange voucher failed:", error.response?.data || error)
      throw new Error(error?.response?.data?.message || "Exchange voucher failed")
    }
  },

  // ====================================================
  // 📌 NEW API — Exchange bằng group_name (BACKEND MỚI)
  // PUT /voucher/exchange-by-group
  // ====================================================
  async exchangeByGroup(groupName: string, customerPhone: string) {
    const res = await api.put("/voucher/exchange-by-group", {
      groupName,
      customerPhone,
    })
    return res.data
  },

  // ====================================================
  // 📌 NEW API — Lấy voucher active của user
  // GET /voucher/my-active?customerPhone=...
  // ====================================================
  async getUserActiveVoucher(phone: string): Promise<Voucher[]> {
    const res = await api.get("/voucher/my-active", {
      params: { customerPhone: phone },
    })
    return res.data
  },

  // ====================================================
  // 📌 NEW API — Xoá theo group_name
  // DELETE /voucher/group/:groupName
  // ====================================================
  async deleteByGroupName(groupName: string) {
    const res = await api.delete(`/voucher/group/${groupName}`)
    return res.data
  },

  // ================================
  // 📌 Xóa nhiều voucher theo id[]
  // ================================
  async deleteMany(ids: number[]) {
    const res = await api.delete("/voucher", {
      data: { voucherIds: ids },
    })
    return res.data
  },

  // ================================
  // 📌 Xóa một voucher
  // ================================
  async delete(id: number) {
    return this.deleteMany([id])
  },


  // ================================
  // 📌 Lấy danh sách GROUP (ADMIN)
  // GET /voucher/groups
  // ================================
  async getGroups(params?: {
    page?: number
    size?: number
    searchName?: string
    orderBy?: string
    orderDirection?: "asc" | "desc"
    onlyActive?: boolean
  }): Promise<PaginatedResponse<VoucherGroup>> {
    const res = await api.get("/voucher/groups", { params })
    return res.data
  },
}
