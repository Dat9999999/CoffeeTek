"use client";

import MenuItemCard from "./MenuItemCard";
import { menuItems } from "@/lib/menuData";

export default function RecommendedItems({ currentItemId }: any) {
  const recommended = menuItems.filter((item) => item.id !== currentItemId).slice(0, 4);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Recommended products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommended.map((item) => (
          <MenuItemCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
