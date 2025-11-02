"use client";

import Image from "next/image";
import ReviewSection from "./ReviewSection";
import ImageCarousel from "@/components/features/menu/ImageCarousel";
import React from "react";

type ItemDetailProps = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  size?: string[];
  calories?: number | null;
};

const ItemDetail: React.FC<ItemDetailProps> = ({
  id,
  name,
  price,
  image,
  images = [],
  description,
  size = [],
  calories,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Ảnh sản phẩm */}
      <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
        {images.length > 1 ? (
          <ImageCarousel images={images} />
        ) : (
          <Image src={image} alt={name} fill className="object-cover" priority />
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

        <p className="text-2xl font-semibold text-green-600 mb-2">{price}₫</p>

        {calories && (
          <p className="text-sm text-gray-500 mb-6">
            Calories: {calories} kcal
          </p>
        )}

        {size.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Choose size:</h3>
            <div className="flex gap-2 flex-wrap">
              {size.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800 transition">
          Add to favorites
        </button>

        <div className="mt-12">
          <ReviewSection itemId={id} />
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
