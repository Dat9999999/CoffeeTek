"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppImage } from "@/components/commons/AppImage";

type MenuItemCardProps = {
  id: number;
  name: string;
  price?: number;
  image?: string;
  description?: string;
  category?: string;
};

export default function MenuItemCard({
  id,
  name,
  price,
  image,
  description,
}: MenuItemCardProps) {
  return (
    <div
      className="group bg-white p-5 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 
                hover:-translate-y-1 border border-transparent hover:border-green-100"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
        <AppImage
          src={image}
          alt={name}
          preview={false}
          isContain={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-green-700 transition-colors">
          {name}
        </h3>
        {price && (
          <p className="text-gray-500 font-medium mb-1">
            {price.toLocaleString()}₫
          </p>
        )}
        {description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <Link href={`/menu/${id}`}>
          <Button
            className="w-full py-2 rounded-full bg-green-600 hover:bg-green-700 
                      text-white font-medium transition-all duration-300 
                      hover:scale-[1.02] shadow-sm hover:shadow-md"
          >
            See details
          </Button>
        </Link>
      </div>
    </div>
  );
}
