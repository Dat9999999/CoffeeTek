"use client";

import React, { useEffect, useState } from "react";
import MenuItemCard from "@/components/features/menu/MenuItemCard";
import CategoryList from "@/components/features/menu/CategoryList";
import SearchFilter from "@/components/features/menu/SearchFilter";
import { productService } from "@/services/productService";

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll({
          page: 1,
          size: 20,
          orderBy: "id",
          orderDirection: "asc",
        });

        // ✅ Lấy danh sách sản phẩm chuẩn
        const list = Array.isArray(res) ? res : res?.data || [];

        // ✅ Chuẩn hóa image_url thành URL đầy đủ
        const normalized = list.map((item: any) => ({
          ...item,
          image_url: item.image_url
            ? `${IMAGE_BASE_URL.replace(/\/$/, "")}/${item.image_url.replace(/^\//, "")}`
            : "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        }));

        setProducts(normalized);
      } catch (error) {
        console.error("❌ Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading menu...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <CategoryList />

      {/* Nội dung chính */}
      <main className="flex-1 ml-48 p-6">
        <section className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Our Menu
          </h1>

          <div className="mt-6">
            <SearchFilter />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price || 0}
                description={item.description}
                image={item.images?.[0]?.image_name || "/placeholder.jpg"} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
