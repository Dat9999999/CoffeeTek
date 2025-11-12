"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function SearchFilter({ onSearch, onFilter }: any) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSearch?.(search);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-3 mt-8 justify-center"
    >
      {/* Ô tìm kiếm */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find products..."
          className="pl-10 pr-3 py-2 w-64 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none shadow-sm"
        />
      </div>

      {/* Ô filter */}
      <div className="relative">
        <Filter
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <select
          onChange={(e) => onFilter?.(e.target.value)}
          className="pl-10 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none shadow-sm"
        >
          <option value="">Filter by</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Highly appreciated</option>
        </select>
      </div>

      {/* Nút tìm */}
      <button
        type="submit"
        className="px-5 py-2 rounded-xl bg-black text-white shadow hover:bg-gray-800 transition"
      >
        Find
      </button>
    </form>
  );
}
