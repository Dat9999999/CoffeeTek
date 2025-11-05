"use client"

import { useEffect, useState } from "react"
import VoucherList from "@/components/features/voucher/VoucherList"
import { voucherService } from "@/services/voucherService"

export interface Voucher {
  id: number
  discountRate: number
  validFrom: string
  validTo: string
  minAmountOrder: number
  requirePoint: number
}

export default function MyVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await voucherService.getAll({ size: 1, page: 10 });
        setVouchers(data)
      } catch (err) {
        console.error("Error fetching vouchers:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchVouchers()
  }, [])

  return (
    <div className="min-h-screen bg-[#fdf6ec] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#5c4033] mb-8">
          🎫 My Vouchers
        </h1>

        <VoucherList vouchers={vouchers} loading={loading} />
      </div>
    </div>
  )
}
