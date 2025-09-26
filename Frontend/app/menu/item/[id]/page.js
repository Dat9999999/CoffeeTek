"use client";

import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { menuItems } from "@/lib/menuData";
import ItemDetail from "@/components/menu/ItemDetail";

export default function ItemDetailPage() {
  const { id } = useParams();
  const item = menuItems.find((p) => p.id === id);

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Không tìm thấy sản phẩm.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <ItemDetail {...item} />
      </main>
      <Footer />
    </div>
  );
}
