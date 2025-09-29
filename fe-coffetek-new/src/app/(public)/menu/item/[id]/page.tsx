"use client";

import { useParams } from "next/navigation";

import ItemDetail from "@/components/features/menu/ItemDetail";
import { menuItems } from "@/lib/menuData";
import BackButton from "@/components/commons/BackButton";

export default function ItemDetailPage() {
  const { id } = useParams();
  const item = menuItems.find((p) => p.id === id);

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">No products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto pt-4 px-6 pb-12">
        <div className="pt-0 mb-6">
          <BackButton label="Back to menu" />
        </div>
        <ItemDetail {...item} />
      </div>
    </div>
  );
}
