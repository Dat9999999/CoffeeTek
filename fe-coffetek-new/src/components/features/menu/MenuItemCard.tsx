"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MenuItemCardProps = {
  id: number;
  name: string;
  price?: number;
  image?: string;
  description?: string;
};

export default function MenuItemCard({
  id,
  name,
  price,
  image,
  description,
}: MenuItemCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      {/* Hình ảnh */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm h-full">
            No Image
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        {price && (
          <p className="text-amber-700 font-medium mb-1">
            {price.toLocaleString()}₫
          </p>
        )}
        {description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <Link href={`/menu/${id}`}>
          <Button className="w-full py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium transition">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </div>
  );
}
