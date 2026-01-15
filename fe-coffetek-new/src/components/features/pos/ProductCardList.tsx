"use client";

import React, { useEffect, useState } from "react";
import { Pagination, Row, Col, Spin, Empty, theme } from "antd";
import { Product } from "@/interfaces";
import { PosProduct, PosProductSize, productService } from "@/services";
import { AppImage, AppImageSize } from "@/components/commons";
import { formatCompactPriceProduct } from "@/utils";

interface ProductCardListProps {
    categoryId?: number | null;
    pageSize?: number;
    onSelect?: (product: Product) => void;
}

/**
 * @description Tính % giảm giá từ giá cũ và giá mới
 */
const calculateDiscountPercent = (
    oldPrice: number | null | undefined,
    newPrice: number | null | undefined
): number => {
    const oldP = oldPrice ?? 0;
    const newP = newPrice ?? 0;

    if (oldP <= 0 || oldP <= newP) {
        return 0;
    }

    return ((oldP - newP) / oldP) * 100;
};

/**
 * @description Lấy % giảm giá CAO NHẤT từ 1 sản phẩm
 */
const getBestDiscountPercent = (product: PosProduct): number => {
    const discounts: number[] = [];

    discounts.push(calculateDiscountPercent(product.old_price, product.price));

    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach((size: PosProductSize) => {
            discounts.push(calculateDiscountPercent(size.old_price, size.price));
        });
    }

    if (discounts.length === 0) return 0;
    return Math.max(...discounts);
};

// ✅ HÀM MỚI: Định dạng % giảm giá theo yêu cầu
const formatDiscountPercent = (discount: number): string => {
    if (discount <= 0) return "0";

    // 1. Nếu giảm giá >= 1%, làm tròn LÊN (Ceiling)
    if (discount >= 1) {
        return Math.ceil(discount).toString();
    }

    // 2. Nếu giảm giá < 1% (ví dụ 0.5% hoặc 0.15%)
    // Làm tròn 2 chữ số thập phân và xóa số 0 thừa (nếu có)
    // (0.10 -> "0.1", 0.55 -> "0.55", 0.01 -> "0.01")
    return parseFloat(discount.toFixed(2)).toString();
};

export function ProductCardList({
    categoryId = null,
    pageSize = 24,
    onSelect,
}: ProductCardListProps) {
    const [products, setProducts] = useState<PosProduct[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const { token } = theme.useToken();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productService.getAllPos({
                page,
                size: pageSize,
                categoryId: categoryId ?? undefined,
                isTopping: false,
            });
            setProducts(res.data);
            setTotal(res.meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [categoryId]);

    useEffect(() => {
        fetchProducts();
    }, [page, categoryId]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                overflowX: "hidden",
            }}
        >
            {/* Danh sách sản phẩm */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingBottom: 16,
                    overflowX: "hidden",
                }}
            >
                {loading ? (
                    <Spin size="small" style={{ display: "block", margin: "40px auto" }} />
                ) : products.length !== 0 ? (
                    <Row gutter={[20, 20]} style={{ overflowX: "hidden" }}>
                        {products.map((product) => {
                            // 1. Lấy % giảm giá (dạng số)
                            const bestDiscount = getBestDiscountPercent(product);

                            // ✅ 2. Lấy % giảm giá đã định dạng (dạng chuỗi)
                            const formattedDiscount = formatDiscountPercent(bestDiscount);

                            const isDisabled = product.isActive === false;

                            return (
                                <Col
                                    key={product.id}
                                    xs={12}
                                    sm={8}
                                    md={6}
                                    lg={6}
                                    xl={6}
                                    onClick={() => !isDisabled && onSelect?.(product)}
                                    style={{ overflow: "hidden", padding: token.paddingSM }}
                                >
                                    <div
                                        className={`relative border-2 border-solid rounded-lg shadow-md overflow-hidden transition-all duration-200 ease-out ${
                                            isDisabled
                                                ? 'opacity-60 cursor-not-allowed grayscale'
                                                : 'cursor-pointer hover:shadow-xl hover:scale-[1.03]'
                                        }`}
                                        style={{
                                            aspectRatio: "1 / 1",
                                            padding: 0,
                                            borderColor: isDisabled ? token.colorError : token.colorBorderSecondary,
                                            backgroundColor: token.colorBgContainer,
                                        }}
                                    >
                                        <AppImageSize
                                            height={"100%"}
                                            width={"100%"}
                                            alt={product.name}
                                            src={product.images?.[0]?.image_name}
                                            style={{
                                                objectFit: "cover",
                                            }}
                                            preview={false}
                                        />

                                        {/* Disabled badge */}
                                        {isDisabled && (
                                            <div
                                                className="absolute top-2 left-2 z-10 px-3 py-1 rounded-full text-white font-bold shadow-lg"
                                                style={{
                                                    backgroundColor: token.colorError,
                                                    fontSize: 12,
                                                }}
                                            >
                                                Out of Stock
                                            </div>
                                        )}

                                        {/* ✅ Giá góc trên phải */}
                                        <div
                                            className="absolute top-0 right-0 text-white font-bold px-4 py-3 rounded-bl-lg overflow-hidden"
                                            style={{
                                                minWidth: "50%",
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                textAlign: "center",
                                            }}
                                        >
                                            {/* Lớp phủ mờ */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    backgroundColor: token.colorPrimary,
                                                    opacity: 0.85,
                                                    backdropFilter: "blur(10px)",
                                                    WebkitBackdropFilter: "blur(10px)",
                                                    zIndex: 0,
                                                }}
                                            />
                                            {/* Text hiển thị phía trên */}
                                            <span
                                                style={{
                                                    position: "relative",
                                                    zIndex: 1,
                                                    fontSize: 20,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {/* ✅ 3. Sử dụng HÀM MỚI để hiển thị */}
                                                {bestDiscount > 0 && (
                                                    <span style={{ fontWeight: "bold", color: "#fff566", fontSize: 22 }}>
                                                        -{formattedDiscount}% |{" "}
                                                    </span>
                                                )}

                                                {formatCompactPriceProduct(product, {
                                                    includeSymbol: false,
                                                })}
                                            </span>
                                        </div>

                                        {/* Tên sản phẩm dưới cùng */}
                                        <div
                                            className="absolute bottom-0 left-0 w-full"
                                            style={{
                                                background: isDisabled
                                                    ? `linear-gradient(to top, ${token.colorTextSecondary}dd, ${token.colorTextSecondary}88, transparent)`
                                                    : `linear-gradient(to top, ${token.colorPrimary}dd, ${token.colorPrimary}88, transparent)`,
                                                padding: token.paddingMD,
                                            }}
                                        >
                                            <div
                                                className="text-white font-semibold"
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    wordBreak: "break-word",
                                                    lineHeight: "1.4em",
                                                    maxHeight: "3em",
                                                    textAlign: "center",
                                                    fontSize: 18,
                                                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                                }}
                                            >
                                                {product.name}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <Empty 
                        description={
                            <span style={{ fontSize: 16, color: token.colorTextSecondary }}>
                                No data available
                            </span>
                        } 
                        style={{ marginTop: 50 }} 
                    />
                )}
            </div>

            {/* Pagination */}
            {!loading && (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "auto",
                        paddingTop: 8,
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    <Pagination
                        current={page}
                        total={total}
                        pageSize={pageSize}
                        showSizeChanger={false}
                        onChange={(p) => setPage(p)}
                    />
                </div>
            )}
        </div>
    );
}