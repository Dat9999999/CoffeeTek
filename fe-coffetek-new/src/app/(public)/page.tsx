"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Menu from "@/components/sections/Menu";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loginSuccess = searchParams.get("login");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (loginSuccess === "success") {
      setShowBanner(true);

      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  return (
    <div className="relative min-h-screen">
      <Menu />
      
      {/* Floating Kiosk Button */}
      <button
        onClick={() => router.push("/kiosk")}
        className="fixed bottom-8 right-8 z-50 bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Go to Kiosk"
      >
        <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Kiosk</span>
      </button>
    </div>
  );
}
