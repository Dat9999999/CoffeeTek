"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VoucherCardProps {
  id: number;
  discountRate: number;
  validFrom: string;
  validTo: string;
  minAmountOrder: number;
  requirePoint: number;
  onClick?: () => void;
}

export default function VoucherCard({
  id,
  discountRate,
  validFrom,
  validTo,
  minAmountOrder,
  requirePoint,
  onClick,
}: VoucherCardProps) {
  return (
    <Card
      key={id}
      className="bg-white/70 backdrop-blur-sm border border-[#e2c9a0] shadow-md hover:shadow-lg transition-all duration-300"
    >
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xl font-semibold text-[#5c4033]">
          🎁 Giảm {discountRate * 100}%
        </h2>
        <p className="text-sm text-gray-600">
          <strong>Áp dụng cho đơn từ:</strong>{" "}
          {minAmountOrder.toLocaleString()}₫
        </p>
        <p className="text-sm text-gray-600">
          <strong>Điểm yêu cầu:</strong> {requirePoint}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Hiệu lực:</strong>{" "}
          {new Date(validFrom).toLocaleDateString()} -{" "}
          {new Date(validTo).toLocaleDateString()}
        </p>
        <Button
          onClick={onClick}
          className="w-full bg-[#c49b63] hover:bg-[#b08850] text-white rounded-xl"
        >
          Dùng ngay
        </Button>
      </CardContent>
    </Card>
  );
}
