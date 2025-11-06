"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ItemDetail from "@/components/features/menu/ItemDetail";
import BackButton from "@/components/commons/BackButton";
import { productService } from "@/services/productService";

const BASE_IMAGE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"; // fallback

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await productService.getById(Number(id));
        if (!res) {
          setItem(null);
          return;
        }

        // Chuẩn hoá ảnh để đảm bảo URL đầy đủ
        const imageUrl =
          res.image_url?.startsWith("http")
            ? res.image_url
            : `${BASE_IMAGE_URL}/${res.image_url || "placeholder.png"}`;

        const images =
          Array.isArray(res.images) && res.images.length > 0
            ? res.images.map((img: string) =>
                img.startsWith("http") ? img : `${BASE_IMAGE_URL}/${img}`
              )
            : [imageUrl];

        setItem({
          ...res,
          image_url: imageUrl,
          images,
        });
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
          image={item.image_url}
          images={item.images}
          size={item.sizes || []}
          calories={item.calories || null}
        />
      </div>
    </div>
  );
}
