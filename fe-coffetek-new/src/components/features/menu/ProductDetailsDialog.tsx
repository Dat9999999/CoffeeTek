"use client";

import { useEffect, useState } from "react";
import { Modal, Spin, Tag, Divider, message } from "antd";
import { Share2, X, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productService } from "@/services/productService";
import { getImageUrl } from "@/utils/image";
import { formatPriceProduct } from "@/utils/formatPriceProduct";
import type { Product } from "@/interfaces";
import ImageCarousel from "@/components/features/menu/ImageCarousel";
import Image from "next/image";

interface ProductDetailsDialogProps {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onAddToCart?: (item: {
    product: Product;
    quantity: number;
    selectedSize: number | null;
    selectedOptions: Record<number, number>;
    selectedToppings: number[];
    totalPrice: number;
  }) => void;
}

export default function ProductDetailsDialog({
  open,
  productId,
  onClose,
}: ProductDetailsDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93";
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !open) {
        setProduct(null);
        return;
      }

      try {
        setLoading(true);
        const res = await productService.getById(productId);
        if (!res) {
          setProduct(null);
          return;
        }
        setProduct(res);
        
        // Auto-select first size if multi-size
        if (res.is_multi_size && res.sizes && res.sizes.length > 0) {
          setSelectedSize(res.sizes[0].id);
        }
        
        // Reset selections
        setSelectedOptions({});
        setSelectedToppings([]);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, open]);

  const handleSizeSelect = (sizeId: number) => {
    setSelectedSize(sizeId);
  };

  const handleOptionSelect = (groupId: number, valueId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: valueId,
    }));
  };

  const handleToppingToggle = (toppingId: number) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let basePrice = 0;

    // Get base price from size or product price
    if (product.is_multi_size && selectedSize && product.sizes) {
      const size = product.sizes.find((s) => s.id === selectedSize);
      basePrice = size ? size.price : product.price || 0;
    } else {
      basePrice = product.price || 0;
    }

    // Add toppings price
    const toppingsPrice = product.toppings
      ? product.toppings
          .filter((t) => selectedToppings.includes(t.id))
          .reduce((sum, t) => sum + t.price, 0)
      : 0;

    return (basePrice + toppingsPrice) * quantity;
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.product_detail || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      message.success("Link copied to clipboard!");
    }
  };

  const getProductImages = () => {
    if (!product) return [];
    
    if (product.images && product.images.length > 0) {
      return product.images
        .sort((a, b) => a.sort_index - b.sort_index)
        .map((img) => getImageUrl(img.image_name));
    }
    
    return [getImageUrl()];
  };

  const images = getProductImages();
  const totalPrice = calculateTotalPrice();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      closeIcon={
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </motion.div>
      }
      className="product-details-modal"
      styles={{
        body: { padding: 0, maxHeight: "90vh", overflowY: "auto" },
      }}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[500px]"
          >
            <Spin size="large" />
          </motion.div>
        ) : !product ? (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[500px]"
          >
            <p className="text-gray-600 text-lg">Product not found</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6 lg:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="relative">
                {images.length > 1 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageCarousel images={images} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-[350px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <Image
                      src={images[0] ||DEFAULT_IMAGE}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1509042239860-f550ce710b93";
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col">
                {/* Category Tag */}
                {product.category && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Tag
                      color="orange"
                      className="mb-4 w-fit text-sm px-3 py-1 rounded-full border-0"
                      style={{
                        background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {product.category.name}
                    </Tag>
                  </motion.div>
                )}

                {/* Product Name */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight"
                >
                  {product.name}
                </motion.h2>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      {formatPriceProduct(product, { includeSymbol: true })}
                    </span>
                    {product.is_multi_size && product.sizes && product.sizes.length > 1 && (
                      <span className="text-sm text-gray-500">(varies by size)</span>
                    )}
                  </div>
                </motion.div>

                {/* Description */}
                {product.product_detail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                      {product.product_detail}
                    </p>
                  </motion.div>
                )}

                <Divider className="my-6 bg-gray-200" />

              {/* Size Selection */}
              {product.is_multi_size && product.sizes && product.sizes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}                  className="mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Choose Size <span className="text-orange-600">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((productSize) => (
                      <motion.button
                        key={productSize.id}
                        onClick={() => handleSizeSelect(productSize.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-5 py-3 rounded-xl border-2 font-medium transition-all text-sm min-w-[100px] ${
                          selectedSize === productSize.id
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-md"
                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:shadow-sm"
                        }`}
                      >
                        {selectedSize === productSize.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        <div className="font-bold text-base">{productSize.size.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {productSize.price.toLocaleString()}₫
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Options Selection */}
              {product.optionGroups && product.optionGroups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-6"
                >
                  {product.optionGroups.map((group) => (
                    <div key={group.id} className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {group.name} <span className="text-orange-600">*</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => (
                          <motion.button
                            key={value.id}
                            onClick={() => handleOptionSelect(group.id, value.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm ${
                              selectedOptions[group.id] === value.id
                                ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-md"
                                : "border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:shadow-sm"
                            }`}
                          >
                            {selectedOptions[group.id] === value.id && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                <Check className="w-2.5 h-2.5 text-white" />
                              </motion.span>
                            )}
                            {value.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Toppings Selection */}
              {product.toppings && product.toppings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Toppings</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {product.toppings.map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      return (
                        <motion.label
                          key={topping.id}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md"
                              : "border-gray-200 hover:border-orange-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToppingToggle(topping.id)}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                              />
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white pointer-events-none" />
                                </motion.div>
                              )}
                            </div>
                            <span className="font-medium text-gray-700">{topping.name}</span>
                          </div>
                          <span className="text-orange-600 font-bold">
                            +{topping.price.toLocaleString()}₫
                          </span>
                        </motion.label>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <Divider className="my-6 bg-gray-200" />

              {/* Quantity Selector */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-2 border-gray-300 rounded-xl overflow-hidden">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="px-4 py-2 font-bold text-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="text-lg">
                    <span className="text-gray-600">Total: </span>
                    <span className="font-bold text-orange-600 text-xl">
                      {totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 mt-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-4 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

