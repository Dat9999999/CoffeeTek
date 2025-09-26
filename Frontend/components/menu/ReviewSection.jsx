"use client";

export default function ReviewSection({ itemId }) {
  // Dummy reviews
  const reviews = [
    { user: "Nam", rating: 5, comment: "Rất ngon!" },
    { user: "Lan", rating: 4, comment: "Ổn áp, sẽ quay lại." },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Đánh giá</h2>
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="border-b pb-2">
            <p className="font-semibold">{r.user}</p>
            <p>{"⭐".repeat(r.rating)}</p>
            <p className="text-gray-600">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
