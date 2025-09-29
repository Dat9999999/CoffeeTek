import React from "react";
import Link from "next/link";
import MenuItemCard from "@/components/features/menu/MenuItemCard";
import CategoryList from "@/components/features/menu/CategoryList";
import SearchFilter from "@/components/features/menu/SearchFilter";
import { menuItems } from "@/lib/menuData";


export default function MenuPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pt-4">
        <section className="container mx-auto px-6 pb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Our Menu
          </h1>
          <CategoryList />
          <div className="mt-6">
            <SearchFilter />
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {menuItems.map((item: any) => (
              <Link key={item.id} href={`/menu/item/${item.id}`}>
                <MenuItemCard {...item} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
