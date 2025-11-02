"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

interface PromotionCardProps {
  id: number;
  title: string;
  description: string;
  image?: string;
  discountRate?: number;
  validFrom?: string;
  validTo?: string;
  onClick?: () => void;
}

export default function PromotionCard({
  id,
  title,
  description,
  image,
  discountRate,
  validFrom,
  validTo,
  onClick,
}: PromotionCardProps) {
  return (
    <Card
      key={id}
      className="group relative bg-gradient-to-br from-[#fff8f3] to-[#f8f4ef] border border-[#e5cfac]
                 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden
                 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-[#8b5e3c]" />
          <h3 className="text-lg font-bold text-[#5c4033]">{title}</h3>
        </div>

        {discountRate && (
          <p className="text-[#b57a4b] font-semibold text-sm">
            Giảm {discountRate * 100}% 🌟
          </p>
        )}

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {description}
        </p>

        {validFrom && validTo && (
          <p className="text-xs text-gray-500">
            Hiệu lực:{" "}
            {new Date(validFrom).toLocaleDateString()} –{" "}
            {new Date(validTo).toLocaleDateString()}
          </p>
        )}

        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-[#b57a4b] to-[#9b6a3f]
                     hover:from-[#9b6a3f] hover:to-[#7e5430]
                     text-white font-semibold rounded-xl py-2 mt-2 transition-all duration-200"
        >
          Xem chi tiết
        </Button>
      </CardContent>

      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('/coffee-beans-bg.jpg')] bg-cover bg-center" />
    </Card>
  );
}
