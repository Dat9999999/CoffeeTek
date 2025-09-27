"use client";

import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ItemDetail from "@/components/menu/ItemDetail";
import { menuItems } from "@/lib/menuData";
import BackButton from "@/components/common/BackButton";

export default function ItemDetailPage() {
  const { id } = useParams();
  const item = menuItems.find((p) => p.id === id);

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">No products found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto pt-4 px-6 pb-12">
        <div className="pt-0 mb-6">
          <BackButton label="Back to menu" />
        </div>
        <ItemDetail {...item} />
      </main>
      <Footer />
    </div>
  );
}
