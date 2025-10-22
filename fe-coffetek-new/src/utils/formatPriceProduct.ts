import { Product } from "@/interfaces";
import {
    formatPrice,
    formatPriceRange,
    FormatPriceOptions,
    globalCurrency,
    formatCompactPrice,
    formatCompactPriceRange,
} from "@/utils/priceFormatter"; // tuỳ theo đường dẫn của bạn



/**
 * Format giá sản phẩm (tự động chọn giữa 1 giá hoặc range)
 */
export const formatPriceProduct = (
    product: Product | undefined | null,
    options: FormatPriceOptions = {}
): string => {
    if (!product) return "";

    // Nếu sản phẩm không có nhiều size
    if (!product.is_multi_size) {
        return formatPrice(product.price ?? 0, options);
    }

    const sizes = product.sizes ?? [];
    if (sizes.length === 0) {
        return formatPrice(product.price ?? 0, options);
    }

    // Lấy min/max price
    const prices = sizes.map((s) => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (sizes.length === 1 || minPrice === maxPrice) {
        return formatPrice(minPrice, options);
    }

    return formatPriceRange(minPrice, maxPrice, options);
};

/**
 * Format giá sản phẩm rút gọn (VD: 100K, 100K - 200K)
 */
export const formatCompactPriceProduct = (
    product: Product | undefined | null,
    options: FormatPriceOptions = {}
): string => {
    if (!product) return "";

    if (!product.is_multi_size) {
        return formatCompactPrice(product.price ?? 0, options);
    }

    const sizes = product.sizes ?? [];
    if (sizes.length === 0) {
        return formatCompactPrice(product.price ?? 0, options);
    }

    const prices = sizes.map((s) => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (sizes.length === 1 || minPrice === maxPrice) {
        return formatCompactPrice(minPrice, options);
    }

    return formatCompactPriceRange(minPrice, maxPrice, options);
};
