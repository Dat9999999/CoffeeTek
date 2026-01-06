"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { promotionService } from "@/services/promotionService";
import type { Promotion, ProductPromotionItem, Product } from "@/interfaces";
import { getImageUrl } from "@/utils/image";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPromotions, setExpandedPromotions] = useState<Set<number>>(new Set());
  const { isAuthenticated, loading: authLoading } = useAuth(true);

  const togglePromotion = (promoId: number) => {
    setExpandedPromotions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promoId)) {
        newSet.delete(promoId);
      } else {
        newSet.add(promoId);
      }
      return newSet;
    });
  };

  // 🟢 Fetch promotions with product details
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await promotionService.getAll({ page: 1, size: 100 });
        const promotionsData = response.data || [];
        
        // Fetch detailed promotion data including ProductPromotion for each promotion
        const promotionsWithProducts = await Promise.all(
          promotionsData.map(async (promo: Promotion) => {
            try {
              const detail = await promotionService.getById(promo.id);
              return detail || promo;
            } catch (error) {
              console.error(`Error fetching promotion ${promo.id}:`, error);
              return promo;
            }
          })
        );
        
        // Sort promotions: active first, then expired (by end_date descending)
        const sortedPromotions = promotionsWithProducts.sort((a, b) => {
          const now = new Date();
          const aEndDate = new Date(a.end_date);
          const bEndDate = new Date(b.end_date);
          const aIsExpired = aEndDate < now;
          const bIsExpired = bEndDate < now;

          // Active promotions come first
          if (aIsExpired && !bIsExpired) return 1;
          if (!aIsExpired && bIsExpired) return -1;

          // If both are same status, sort by end_date (latest first)
          return bEndDate.getTime() - aEndDate.getTime();
        });

        setPromotions(sortedPromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // Check if promotion is expired
  const isPromotionExpired = (promo: Promotion): boolean => {
    const now = new Date();
    const endDate = new Date(promo.end_date);
    return endDate < now;
  };

  // Calculate discount percentage
  const calculateDiscount = (productPromo: ProductPromotionItem): number => {
    const product = productPromo.Product;
    let originalPrice = 0;

    if (productPromo.productSizeId && product.sizes) {
      // For products with sizes, get the original size price
      const size = product.sizes.find(
        (s) => s.id === productPromo.productSizeId
      );
      originalPrice = size?.price || product.price || 0;
    } else {
      // For products without sizes, use product price
      originalPrice = product.price || 0;
    }

    if (originalPrice === 0) return 0;
    const discount = ((originalPrice - productPromo.new_price) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Get product image
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const sortedImages = product.images.sort((a, b) => a.sort_index - b.sort_index);
      return getImageUrl(sortedImages[0].image_name);
    }
    return getImageUrl();
  };

  // 🟡 Render nội dung có điều kiện (không return sớm)
  return (
    <section className="container mx-auto px-6 py-12">
      {authLoading || loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading promotions...</p>
        </div>
      ) : !isAuthenticated ? (
        <p className="text-center text-gray-500">
          Bạn cần đăng nhập để xem các ưu đãi.
        </p>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8 text-center text-[#5c4033]">
            Offers Available Now
          </h1>

          <div className="space-y-8">
            {promotions.map((promo) => {
              const expired = isPromotionExpired(promo);
              const productCount = promo.ProductPromotion?.length || 0;
              const isExpanded = expandedPromotions.has(promo.id);
              const initialDisplayCount = 6;
              const displayedProducts = isExpanded
                ? promo.ProductPromotion || []
                : (promo.ProductPromotion || []).slice(0, initialDisplayCount);
              const hasMoreProducts = productCount > initialDisplayCount;

              return (
              <div
                key={promo.id}
                  className={`border rounded-2xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                    expired
                      ? "border-gray-300 bg-gray-100/80 opacity-75"
                      : "border-[#e2c9a0] bg-white/90 hover:shadow-xl"
                  }`}
                >
                  {/* Header Section */}
                  <div className="mb-6 relative">
                    {/* Expired Badge */}
                    {expired && (
                      <div className="absolute top-0 right-0 z-10">
                        <Badge className="bg-gray-600 text-white text-xs font-bold px-3 py-1">
                          Expired
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3
                          className={`text-2xl font-bold mb-2 ${
                            expired ? "text-gray-500" : "text-[#5c4033]"
                          }`}
                        >
                  {promo.name}
                </h3>
                        <p
                          className={`text-base mb-2 ${
                            expired ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          {promo.description}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-gray-500">
                  {new Date(promo.start_date).toLocaleDateString()} -{" "}
                  {new Date(promo.end_date).toLocaleDateString()}
                </p>
                          {productCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold"
                            >
                              {productCount} {productCount === 1 ? "product" : "products"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {promo.ProductPromotion && promo.ProductPromotion.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {displayedProducts.map((productPromo) => {
                          const discount = calculateDiscount(productPromo);
                          const product = productPromo.Product;
                          const productImage = getProductImage(product);
                          const sizeName =
                            productPromo.productSizeId && product.sizes
                              ? product.sizes.find(
                                  (s) => s.id === productPromo.productSizeId
                                )?.size.name
                              : null;
                          const originalPrice =
                            productPromo.productSizeId && product.sizes
                              ? product.sizes.find(
                                  (s) => s.id === productPromo.productSizeId
                                )?.price || product.price || 0
                              : product.price || 0;

                          return (
                            <div
                              key={productPromo.id}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                expired
                                  ? "border-gray-300 bg-gray-100 opacity-60"
                                  : "border-gray-200 bg-white hover:border-orange-400 hover:shadow-lg"
                              }`}
                            >
                              {/* Discount Badge */}
                              {discount > 0 && (
                                <div className="absolute top-2 right-2 z-10">
                                  <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1 shadow-lg">
                                    -{discount}%
                                  </Badge>
                                </div>
                              )}

                              {/* Product Image */}
                              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                <Image
                                  src={productImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1509042239860-f550ce710b93";
                                  }}
                                />
                              </div>

                              {/* Product Info */}
                              <div className="p-3">
                                <h4
                                  className={`font-semibold text-sm mb-1 line-clamp-2 ${
                                    expired ? "text-gray-500" : "text-gray-800"
                                  }`}
                                  title={product.name}
                                >
                                  {product.name}
                                </h4>
                                {sizeName && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    Size: {sizeName}
                                  </p>
                                )}
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-400 line-through">
                                    {originalPrice.toLocaleString()}₫
                                  </span>
                                  <span
                                    className={`text-base font-bold ${
                                      expired ? "text-gray-600" : "text-orange-600"
                                    }`}
                                  >
                                    {productPromo.new_price.toLocaleString()}₫
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Show More/Less Button */}
                      {hasMoreProducts && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => togglePromotion(promo.id)}
                            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                              expired
                                ? "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                : "bg-[#c49b63] text-white hover:bg-[#b08850]"
                            }`}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show All {productCount} Products
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No products available in this promotion
                    </p>
                  )}
              </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
