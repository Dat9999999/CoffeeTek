"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Coffee } from "lucide-react";
import type { Voucher } from "@/app/(public)/vouchers/page";

export default function VoucherList({
  vouchers,
  loading,
}: {
  vouchers: Voucher[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin w-8 h-8 text-[#b57a4b]" />
      </div>
    );

  if (!vouchers.length)
    return (
      <p className="text-center text-gray-500 text-lg mt-10">
        Bạn chưa có voucher nào 😢 <br />
        Hãy tích điểm để nhận ưu đãi hấp dẫn nhé!
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
      {vouchers.map((voucher) => (
        <Card
          key={voucher.id}
          className="relative bg-gradient-to-br from-[#fff8f3] to-[#f9f4ee] border border-[#e7d5b3] shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden 
                     hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out"
        >
          {/* Ribbon tag */}
          {voucher.discountRate >= 0.3 && (
            <div className="absolute top-3 right-[-35px] bg-[#c49b63] text-white text-sm font-semibold py-1 px-8 rotate-45 shadow-md">
              Hot Deal
            </div>
          )}

          <CardContent className="p-6 space-y-4 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#8b5e3c]" />
              <h2 className="text-xl font-semibold text-[#5c4033]">
                Giảm {voucher.discountRate * 100}% 🎁
              </h2>
            </div>

            {/* Info */}
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <strong>Áp dụng cho đơn từ:</strong>{" "}
                {voucher.minAmountOrder.toLocaleString()}₫
              </p>
              <p>
                <strong>Điểm yêu cầu:</strong> {voucher.requirePoint}
              </p>
              <p className="text-gray-500 text-[13px]">
                <strong>Hiệu lực:</strong>{" "}
                {new Date(voucher.validFrom).toLocaleDateString()} –{" "}
                {new Date(voucher.validTo).toLocaleDateString()}
              </p>
            </div>

            {/* Action */}
            <Button
              className="w-full mt-3 bg-gradient-to-r from-[#b57a4b] to-[#a0683c] hover:from-[#a0683c] hover:to-[#7f5231] 
                        text-white font-semibold rounded-xl py-2 shadow-inner transition-all duration-200"
            >
              Dùng ngay
            </Button>
          </CardContent>

          {/* Background overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('/coffee-beans-bg.png')] bg-cover bg-center" />
        </Card>
      ))}
    </div>
  );
}
