"use client";
import React from "react";

type FavoriteItem = {
  id: string | number;
  img: string;
  name: string;
  price: number;
};

interface WishlistProps {
  favorites: FavoriteItem[];
}

export default function Wishlist({ favorites }: WishlistProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">Wishlist / Favorite</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Món bạn đã lưu khi duyệt menu.
      </p>

      {favorites?.length === 0 ? (
        <div className="mt-6 text-center text-sm">
          Chưa có món yêu thích nào.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites?.map((it) => (
            <div
              key={it.id}
              className="border rounded-lg overflow-hidden"
            >
              <img
                src={it.img}
                alt={it.name}
                className="w-full h-36 object-cover"
              />
              <div className="p-3">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-muted-foreground">
                  {it.price.toLocaleString("vi-VN")} ₫
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 px-3 py-1 rounded border">
                    Xem
                  </button>
                  <button className="px-3 py-1 rounded bg-red-50">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
