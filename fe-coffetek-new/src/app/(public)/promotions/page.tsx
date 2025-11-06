"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

interface Promotion {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const router = useRouter();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      : null;
  const isLoggedIn = !!token;
  const { isAuthenticated, loading } = useAuth(true);

  // 🟢 Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch(
          `${API_ENDPOINTS.PROMOTION.GET_ALL}?page=1&size=10`
        );
        const json = await res.json();
        setPromotions(json.data || []);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };
    fetchPromotions();
  }, []);

  // 🟢 Handle voucher save
  const handleSaveVoucher = async (promoId: number) => {
    if (!isLoggedIn) {
      localStorage.setItem("pendingVoucherId", String(promoId));
      toast.info("Please login to save this voucher!");
      router.push("/auth/login");
      return;
    }

    try {
      const customerPhone = localStorage.getItem("customerPhone");
      const res = await fetch(
        `${API_ENDPOINTS.VOUCHER.EXCHANGE}?id=${promoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ customerPhone }),
        }
      );

      if (res.ok) toast.success("Voucher saved successfully!");
      else toast.error("Saving voucher failed!");
    } catch (err) {
      toast.error("An error occurred while saving the voucher.");
      console.error(err);
    }
  };

  // 🟡 Render nội dung có điều kiện (không return sớm)
  return (
    <section className="container mx-auto px-6 py-12">
      {loading ? (
        <p>Đang kiểm tra đăng nhập...</p>
      ) : !isAuthenticated ? (
        <p className="text-center text-gray-500">
          Bạn cần đăng nhập để xem các ưu đãi.
        </p>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8 text-center text-[#5c4033]">
            Offers Available Now
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="border border-[#e2c9a0] rounded-xl p-4 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <Image
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93"
                  alt={promo.name}
                  width={400}
                  height={200}
                  className="rounded-lg object-cover"
                />
                <h3 className="text-xl font-semibold mt-3 text-[#5c4033]">
                  {promo.name}
                </h3>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(promo.start_date).toLocaleDateString()} -{" "}
                  {new Date(promo.end_date).toLocaleDateString()}
                </p>
                <Button
                  className="w-full mt-3 bg-[#c49b63] hover:bg-[#b08850] text-white rounded-xl"
                  onClick={() => handleSaveVoucher(promo.id)}
                >
                  {isLoggedIn ? "Save voucher" : "Log in to save"}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
