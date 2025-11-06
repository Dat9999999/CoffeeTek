"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { voucherService } from "@/services/voucherService";

export default function PromotionList({
  promotions,
  loading,
}: {
  promotions: any[];
  loading: boolean;
}) {
  const router = useRouter();
  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("token");

    const handleSaveVoucher = async (promo: any) => {
    if (!isLoggedIn) return router.push("/auth/login")
    const customerPhone = localStorage.getItem("customerPhone")
    try {
        await voucherService.exchange(promo.id, customerPhone || "")
        alert("Voucher đã được lưu vào tài khoản của bạn!")
    } catch (error) {
        alert("Có lỗi khi lưu voucher, vui lòng thử lại!")
        console.error(error)
    }
}


  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin w-8 h-8 text-[#b57a4b]" />
      </div>
    );

  if (!promotions.length)
    return (
      <p className="text-center text-gray-500 text-lg mt-10">
        Hiện chưa có chương trình khuyến mãi nào ☕
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className="group relative rounded-2xl border border-[#e8d8b3] bg-gradient-to-br from-[#fffaf3] to-[#f9f3ea]
                     overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.05)]
                     hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative">
            <Image
              src={promo.imageUrl || "/placeholder.png"}
              alt={promo.name}
              width={220}
              height={220}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70 group-hover:opacity-50 transition-all"></div>

            {/* Ribbon */}
            <div className="absolute top-3 left-3 bg-[#b57a4b] text-white text-sm font-semibold px-3 py-1 rounded-md shadow">
              <Sparkles className="inline-block w-4 h-4 mr-1" /> Ưu đãi hot
            </div>
          </div>

          <div className="p-5 space-y-3">
            <h3 className="text-xl font-semibold text-[#5c4033] leading-tight">
              {promo.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {promo.description}
            </p>

            <Button
              className="w-full bg-gradient-to-r from-[#b57a4b] to-[#9b6a3f] hover:from-[#9b6a3f] hover:to-[#7e5430]
                         text-white font-medium rounded-xl py-2 mt-2 shadow-inner transition-all duration-200"
              onClick={() => handleSaveVoucher(promo)}
            >
              {isLoggedIn ? "Lưu voucher" : "Đăng nhập để lưu"}
            </Button>
          </div>

          {/* Subtle pattern background */}
          <div className="absolute inset-0 bg-[url('/coffee-beans-bg.jpg')] opacity-5 bg-center bg-cover pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
}
