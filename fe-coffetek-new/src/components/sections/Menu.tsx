"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemCard from "@/components/features/menu/MenuItemCard";
import SearchFilter from "@/components/features/menu/SearchFilter";
import { productService } from "@/services/productService";
import api from "@/lib/api";

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

interface Category {
  id: number;
  name: string;
}

export default function Menu() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories', {
          params: { page: 1, size: 100, isParentCategory: true }
        });
        const cats = res.data.data || res.data || [];
        setCategories(cats);
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: 1,
          size: 20,
          orderBy: "id",
          orderDirection: "asc",
        };

        if (selectedCategoryId) {
          params.categoryId = selectedCategoryId;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const res = await productService.getAll(params);
        const list = Array.isArray(res) ? res : res?.data || [];

        // Normalize image URLs
        let normalized = list.map((item: any) => ({
          ...item,
          image_url: item.image_url
            ? `${IMAGE_BASE_URL.replace(/\/$/, "")}/${item.image_url.replace(/^\//, "")}`
            : "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        }));

        // Apply filter
        if (filterValue === "price-low") {
          normalized = normalized.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        } else if (filterValue === "price-high") {
          normalized = normalized.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        }

        setProducts(normalized);
      } catch (error) {
        console.error("❌ Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategoryId, searchQuery, filterValue]);

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const handleFilter = (filter: string) => {
    setFilterValue(filter);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
      {/* Hero Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative py-20 px-4 w-full max-w-full overflow-hidden"
        style={{
          backgroundImage: "url('/image/background-menu.jpg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20" />
        <div className="container mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-center bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent drop-shadow-lg"
          >
            Our Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-white text-center max-w-2xl mx-auto drop-shadow-md"
          >
            Discover our delicious selection of coffee and treats
          </motion.p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 container mx-auto px-4 pb-20 -mt-8">
        {/* Sidebar - Category Filter */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-64 flex-shrink-0"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Categories</h3>
            <div className="space-y-2">
              <motion.button
                variants={categoryVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedCategoryId(null)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategoryId === null
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </motion.button>
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.id}
                  variants={categoryVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategoryId === cat.id
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Search and Filter with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
          </motion.div>

          {/* Products Grid with Animation */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col justify-center items-center py-20 text-gray-600"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ☕
              </motion.div>
              <div className="text-xl font-semibold">No products found</div>
              <div className="text-sm text-gray-500 mt-2">Try a different category or search term</div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="wait">
                {products.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    <MenuItemCard
                      id={item.id}
                      name={item.name}
                      price={(() => {
                        // If product has multiple sizes, get the minimum price from sizes
                        if (item.is_multi_size && item.sizes && item.sizes.length > 0) {
                          const prices = item.sizes.map((s: any) => s.price || 0).filter((p: number) => p > 0);
                          if (prices.length > 0) {
                            return Math.min(...prices);
                          }
                        }
                        // Otherwise, use the base price if it's greater than 0
                        return (item.price && item.price > 0) ? item.price : null;
                      })()}
                      description={item.description}
                      image={item.images?.[0]?.image_name || item.image_url || "/placeholder.jpg"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

