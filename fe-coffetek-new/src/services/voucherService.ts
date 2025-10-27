import { Voucher } from "@/interfaces";
import api from "@/lib/api";

export const voucherService = {
    async getAll(params?: {
        page?: number;
        size?: number;
        searchName?: string;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }) {
        const res = await api.get("/voucher", { params });
        return res.data;
    },

    async getByCode(code: string) {
        const res = await api.get(`/voucher/${code}`);
        return res.data;
    },

    async create(data: {
        quantity: number;
        discountRate: number;
        validFrom: string;
        validTo: string;
        minAmountOrder: number;
        requirePoint: number;
    }) {
        const res = await api.post("/voucher", data);
        return res.data;
    },

    async exchangeVoucher(id: number, data: { customerPhone: string }) {
        const res = await api.put(`/voucher?id=${id}`, data);
        return res.data;
    },

    async deleteMany(ids: number[]) {
        const res = await api.delete("/voucher", { data: { voucherIds: ids } });
        return res.data;
    },
    async delete(id: number) {
        const res = await api.delete("/voucher", { data: { voucherIds: [id] } });
        return res.data;
    },
};