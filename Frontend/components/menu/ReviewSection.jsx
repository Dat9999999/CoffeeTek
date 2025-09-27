"use client";

import { Star } from "lucide-react";

export default function ReviewSection({ itemId }) {
  const reviews = [
    { user: "Nam", rating: 5, comment: "Rất ngon!" },
    { user: "Lan", rating: 4, comment: "Ổn áp, sẽ quay lại." },
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Evaluate</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">There are no reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-4 border rounded-xl bg-white/50 shadow-sm"
            >
              {/* Tên người dùng */}
              <p className="font-medium text-gray-800">{r.user}</p>

              {/* Rating bằng sao */}
              <div className="flex items-center gap-1 my-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={idx < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>

              {/* Bình luận */}
              <p className="text-gray-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
