"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Banner from "@/components/sections/Banner";
import Explore from "@/components/sections/Explore";
import OrderCoffee from "@/components/sections/OrderCoffee";
import SellingCoffee from "@/components/sections/SellingCoffee";
import InstantCoffee from "@/components/sections/InstantCoffee";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  const searchParams = useSearchParams();
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
    <div className="relative">
      {showBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn z-50">
          You have successfully logged in
        </div>
      )}

      <Banner />
      <Explore />
      <OrderCoffee />
      <SellingCoffee />
      <InstantCoffee />
      <Testimonial />
    </div>
  );
}
