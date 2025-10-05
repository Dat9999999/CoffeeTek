"use client";
import React from "react";

interface LoyaltyProps {
  loyalty: any;
}

export default function Loyalty({ loyalty }: LoyaltyProps) {
  const points = loyalty?.points || 0;
  const nextLevel = loyalty?.nextLevel || 100;
  const pct = Math.min(100, Math.round((points / nextLevel) * 100));

  return (
    <div>
      <h3 className="text-lg font-semibold">Loyalty & Membership</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Điểm tích lũy và cấp độ thành viên.
      </p>

      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Điểm hiện tại</div>
            <div className="text-2xl font-bold">{points} pts</div>
          </div>
          <div className="text-right">
            <div className="text-sm">Next: {nextLevel} pts</div>
            <div className="text-sm text-muted-foreground">
              Còn lại {Math.max(0, nextLevel - points)} pts
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              style={{ width: `${pct}%` }}
              className="h-3 rounded-full bg-amber-400"
            />
          </div>
          <div className="mt-2 text-sm">
            Tiến trình: {pct}% đến cấp độ tiếp theo
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Cấp độ & Lợi ích</h4>
          <ul className="mt-2 space-y-2">
            {loyalty?.levels?.map((l: any) => (
              <li key={l.name} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Từ {l.threshold} pts
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {l.benefit}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 text-right">
          <a className="text-sm underline">Cách để tích điểm?</a>
        </div>
      </div>
    </div>
  );
}
