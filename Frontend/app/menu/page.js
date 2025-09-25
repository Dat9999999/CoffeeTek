import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MenuItemCard from "@/app/menu/MenuItemCard";
import { menuItems } from "@/lib/menuData";

export default function MenuPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Menu của chúng tôi
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
