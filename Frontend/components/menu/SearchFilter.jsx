"use client";

import { useState } from "react";

export default function SearchFilter({ onSearch, onFilter }) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(search);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mt-6 justify-center">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm sản phẩm..."
        className="border rounded px-3 py-2 w-64"
      />
      <select
        onChange={(e) => onFilter?.(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Lọc theo</option>
        <option value="price-low">Giá: Thấp → Cao</option>
        <option value="price-high">Giá: Cao → Thấp</option>
        <option value="rating">Đánh giá cao</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded"
      >
        Tìm
      </button>
    </form>
  );
}
