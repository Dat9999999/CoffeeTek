"use client";
import React, { useState } from "react";
import UserProfile from "./UserProfile";
import OrderHistory from "./OrderHistory";
import Wishlist from "./Wishlist";
import Loyalty from "./Loyalty";

interface ProfileLayoutProps {
  profile: any;
  orders: any;
  favorites: any;
  loyalty: any;
}

export default function ProfileLayout({
  profile,
  orders,
  favorites,
  loyalty,
}: ProfileLayoutProps) {
  const tabs = [
    { id: "profile", label: "Thông tin cá nhân" },
    { id: "orders", label: "Lịch sử đơn hàng" },
    { id: "wishlist", label: "Wishlist / Favorite" },
    { id: "loyalty", label: "Loyalty Points" },
  ];

  const [active, setActive] = useState<string>("profile");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <nav className="mt-6 flex lg:flex-col gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`text-left px-3 py-2 rounded-lg w-full hover:bg-gray-50 transition 
                    ${active === t.id ? "bg-amber-50 ring-1 ring-amber-200" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-1">
            {active === "profile" && <UserProfile profile={profile} />}
            {active === "orders" && <OrderHistory orders={orders} />}
            {active === "wishlist" && <Wishlist favorites={favorites} />}
            {active === "loyalty" && <Loyalty loyalty={loyalty} />}
          </section>
        </div>
      </div>
    </div>
  );
}
