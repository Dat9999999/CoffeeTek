"use client";

import React, { useEffect, useState } from "react";
import { Pagination, Row, Col, Spin, Empty, theme } from "antd";
import { Product } from "@/interfaces";
import { productService } from "@/services";
import { AppImage } from "@/components/commons";
import { formatCompactPriceProduct } from "@/utils";

interface ProductCardListProps {
    categoryId?: number | null;
    pageSize?: number;
    onSelect?: (product: Product) => void;
}

export function ProductCardList({
    categoryId = null,
    pageSize = 24,
    onSelect,
}: ProductCardListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // dùng token.colorPrimary
    const { token } = theme.useToken();


    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productService.getAll({
                page,
                size: pageSize,
                categoryId: categoryId ?? undefined,
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
                    <Row gutter={[8, 8]} style={{ overflowX: "hidden" }}>
                        {products.map((product) => (
                            <Col
                                key={product.id}
                                xs={12} sm={8} md={6} lg={4} xl={{ flex: "0 0 20%" }}
                                onClick={() => onSelect?.(product)}
                                style={{ overflow: "hidden" }}
                            >
                                <div
                                    className="relative border border-solid rounded-md shadow-sm cursor-pointer overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-all duration-300 ease-out"
                                    style={{
                                        aspectRatio: "1 / 1",
                                        padding: 0,
                                    }}
                                >
                                    <AppImage
                                        alt={product.name}
                                        src={product.images?.[0]?.image_name}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                            objectFit: "cover",
                                        }}
                                        preview={false}
                                    />

                                    {/* ✅ Giá góc trên phải */}
                                    <div
                                        className="absolute top-0 right-0 text-white text-xs font-semibold px-2 py-1 rounded-bl-md overflow-hidden"
                                        style={{
                                            minWidth: "40%",
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            textAlign: "center"

                                        }}
                                    >
                                        {/* Lớp phủ mờ (background theo token) */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                backgroundColor: token.colorPrimary,
                                                opacity: 0.60,
                                                backdropFilter: "blur(8px)",
                                                WebkitBackdropFilter: "blur(8px)",
                                                zIndex: 0,

                                            }}
                                        />
                                        {/* Text hiển thị phía trên */}
                                        <span style={{
                                            position: "relative",
                                            zIndex: 1,
                                        }}>
                                            {formatCompactPriceProduct(product, { includeSymbol: false })}
                                        </span>
                                    </div>


                                    {/* Tên sản phẩm dưới cùng */}
                                    <div
                                        className="absolute bottom-0 left-0 w-full"
                                        style={{
                                            background: `linear-gradient(to top, ${token.colorPrimary}, transparent)`,

                                            padding: "4px",
                                        }}
                                    >
                                        <div
                                            className="text-white text-sm font-medium"
                                            style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                wordBreak: "break-word",
                                                lineHeight: "1.3em",
                                                maxHeight: "2.5em",
                                                textAlign: "center",
                                            }}
                                        >
                                            {product.name}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty description="No data" style={{ marginTop: 50 }} />
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
