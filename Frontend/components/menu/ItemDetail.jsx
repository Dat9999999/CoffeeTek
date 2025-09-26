"use client";

import ReviewSection from "./ReviewSection";

export default function ItemDetail({ id, name, price, image, description, size, calories }) {
  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Hình ảnh sản phẩm */}
      <div className="flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-80 h-80 object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-3">{name}</h1>
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Giá */}
        <p className="text-2xl font-bold text-green-600 mb-4">{price}₫</p>

        {/* Calories */}
        {calories && (
          <p className="text-sm text-gray-500 mb-4">
            Calories: {calories} kcal
          </p>
        )}

        {/* Size (nếu có) */}
        {size && (
          <div className="flex gap-3 mb-6">
            {size.map((s) => (
              <span
                key={s}
                className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Nút Add to Cart */}
        <button className="px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800">
          Add to Cart
        </button>

        {/* Reviews */}
        <div className="mt-10">
          <ReviewSection itemId={id} />
        </div>
      </div>
    </div>
  );
}
