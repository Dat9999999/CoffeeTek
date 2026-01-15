"use client";
import React, { useState } from "react";
import UserProfile from "./UserProfile";
import OrderHistory from "./OrderHistory";
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
    { id: "profile", label: "Personal Information" },
    { id: "orders", label: "Order History" },
    { id: "loyalty", label: "Loyalty Points" },
  ];

  const [active, setActive] = useState<string>("profile");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Account
          </h2>
          <nav className="flex lg:flex-col gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`text-left px-4 py-2 rounded-lg transition-all duration-150
                  ${
                    active === t.id
                      ? "bg-amber-100 text-amber-800 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-8 bg-white">
          {active === "profile" && <UserProfile />}
          {active === "orders" && <OrderHistory orders={orders} />}
          {active === "loyalty" && <Loyalty loyalty={loyalty} />}
        </section>
      </div>
    </div>
  );
}
