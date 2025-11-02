"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ItemDetail from "@/components/features/menu/ItemDetail";
import BackButton from "@/components/commons/BackButton";
import { productService } from "@/services/productService";

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await productService.getById(Number(id));
        setItem(res);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading product details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">No product found.</p>
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
        <ItemDetail
          id={item.id}
          name={item.name}
          price={item.price || 0}
          description={item.description || ""}
          image={item.image_url || "/placeholder.png"}
          images={item.images || []}
          size={item.sizes || []}
          calories={item.calories || null}
        />
      </div>
    </div>
  );
}
