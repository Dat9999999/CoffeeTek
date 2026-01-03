"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";

export default function SearchFilter({ onSearch, onFilter }: any) {
  const [search, setSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap items-center gap-3 mt-8 justify-center"
    >
      {/* Search input */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileFocus={{ scale: 1.02 }}
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 pr-3 py-2 w-64 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none shadow-sm transition-all"
        />
      </motion.div>

      {/* Filter dropdown */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
      >
        <Filter
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <select
          onChange={(e) => onFilter?.(e.target.value)}
          className="pl-10 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none shadow-sm transition-all"
        >
          <option value="">Filter by</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Highly appreciated</option>
        </select>
      </motion.div>
    </motion.div>
  );
}
