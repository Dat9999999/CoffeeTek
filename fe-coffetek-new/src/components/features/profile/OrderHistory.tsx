"use client";
import React, { useState } from "react";

interface OrderHistoryProps {
  orders: any[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div>
      <h3 className="text-lg font-semibold">Lịch sử mua hàng</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Danh sách các lần khách mua hàng tại cửa hàng.
      </p>

      <ul className="mt-4 space-y-3">
        {orders?.map((o: any) => (
          <li
            key={o.id}
            className="p-3 border rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="font-medium">
                {o.date} — {o.branch}
              </div>
              <div className="text-sm text-muted-foreground">
                Mã: {o.id} • {o.items?.slice(0, 2).join(", ")}{" "}
                {o.items?.length > 2 ? "..." : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {o.total.toLocaleString("vi-VN")} ₫
              </div>
              <button
                onClick={() => setSelected(o)}
                className="mt-2 text-sm underline"
              >
                See details
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">Chi tiết đơn {selected.id}</h4>
              <p className="text-sm text-muted-foreground">
                {selected.date} — {selected.branch}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-sm"
            >
              Đóng
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {selected.items?.map((it: any, idx: number) => (
              <li key={idx} className="flex justify-between">
                <span>{it}</span>
                <span className="text-muted-foreground">—</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right font-semibold">
            Tổng: {selected.total.toLocaleString("vi-VN")} ₫
          </div>
        </div>
      )}
    </div>
  );
}
