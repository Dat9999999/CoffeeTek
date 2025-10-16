"use client";

import { useEffect, useRef, useState } from "react";
import {
    Modal,
    Descriptions,
    Carousel,
    Spin,
    Typography,
    Image,
    Divider,
    Tag,
    theme,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { CarouselRef } from "antd/es/carousel";
import { productService } from "@/services/productService";
import type { ProductDetail } from "@/interfaces";
import { formatPrice } from "@/utils";
import { AppImageSize } from "@/components/commons";

const { Title, Text } = Typography;

interface ProductDetailModalProps {
    open: boolean;
    recordId?: number;
    onClose: () => void;
}

export function ProductDetailModal({
    open,
    recordId,
    onClose,
}: ProductDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
    const carouselRef = useRef<CarouselRef>(null);

    const { token } = theme.useToken();

    useEffect(() => {
        if (!recordId || !open) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await productService.getById(recordId);
                setProduct(res);
            } catch (error) {
                console.error("Failed to load product detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [recordId, open]);

    return (
        <Modal
            title={
                <Title
                    level={4}
                    style={{
                        margin: 0,
                        color: token.colorTextHeading,
                    }}
                >
                    Product Details
                </Title>
            }
            open={open}
            onCancel={onClose}
            onOk={onClose}
            width={900}
            centered
        // styles={{
        //     content: {
        //         backgroundColor: token.colorBgContainer,
        //         borderRadius: token.borderRadiusLG,
        //         padding: token.paddingLG,
        //         boxShadow: token.boxShadowSecondary,
        //     },
        //     body: {
        //         backgroundColor: token.colorBgLayout,
        //         padding: token.paddingContentVertical,
        //     },
        // }}
        >
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingBlock: token.paddingXL,
                    }}
                >
                    <Spin size="large" />
                </div>
            ) : product ? (
                <>
                    {/* 🖼️ Carousel */}
                    {product.images && product.images.length > 0 ? (
                        <div
                            style={{
                                position: "relative",
                                marginBottom: token.marginLG,
                                borderRadius: token.borderRadiusLG,
                                overflow: "hidden",
                                boxShadow: token.boxShadowSecondary,
                            }}
                        >
                            <Carousel ref={carouselRef} autoplay={false}>
                                {product.images.map((img) => (
                                    <div key={img.image_name}>
                                        <AppImageSize
                                            src={img.image_name}
                                            alt={img.image_name}
                                            width="100%"
                                            height={300}
                                            style={{
                                                objectFit: "contain"
                                            }}
                                        />
                                    </div>

                                ))}
                            </Carousel>
                            {/* Nút điều hướng */}
                            <LeftOutlined
                                onClick={() => carouselRef.current?.prev()}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 12,
                                    fontSize: 22,
                                    color: token.colorTextLightSolid,
                                    background: token.colorBgMask,
                                    padding: token.paddingXS,
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    transform: "translateY(-50%)",
                                }}
                            />
                            <RightOutlined
                                onClick={() => carouselRef.current?.next()}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 12,
                                    fontSize: 22,
                                    color: token.colorTextLightSolid,
                                    background: token.colorBgMask,
                                    padding: token.paddingXS,
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    transform: "translateY(-50%)",
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            style={{
                                color: token.colorTextSecondary,
                                padding: token.paddingLG,
                                textAlign: "center",
                                border: `1px dashed ${token.colorBorderSecondary}`,
                                borderRadius: token.borderRadiusSM,
                                marginBottom: token.marginLG,
                            }}
                        >
                            Chưa có hình ảnh nào.
                        </div>
                    )}

                    {/* 🧾 Thông tin cơ bản */}
                    <Descriptions
                        bordered
                        column={2}
                        size="small"
                        style={{
                            borderRadius: token.borderRadiusSM,
                            marginBottom: token.marginLG,
                        }}
                    >
                        <Descriptions.Item label="ID">{product.id}</Descriptions.Item>
                        <Descriptions.Item label="Name">{product.name}</Descriptions.Item>
                        <Descriptions.Item label="Category">
                            {product.category?.name ?? "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Multi-size">
                            {product.is_multi_size ? "Yes" : "No"}
                        </Descriptions.Item>
                        {!product.is_multi_size && (
                            <Descriptions.Item label="Price" span={2}>
                                {formatPrice(product.price ?? 0, { includeSymbol: true })}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Description" span={2}>
                            {product.product_detail || "—"}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* 📏 Sizes */}
                    {product.is_multi_size && product.sizes && product.sizes.length > 0 && (
                        <>
                            <Divider style={{ borderColor: token.colorBorderSecondary }} />
                            <Title
                                level={5}
                                style={{
                                    color: token.colorTextHeading,
                                    marginBottom: token.marginSM,
                                }}
                            >
                                Available Sizes
                            </Title>

                            <div
                                style={{
                                    background: token.colorBgContainer,
                                    padding: token.paddingSM,
                                    borderRadius: token.borderRadiusSM,
                                    boxShadow: token.boxShadowSecondary,
                                }}
                            >
                                {product.sizes.map((s) => (
                                    <div
                                        key={s.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                                            paddingBlock: token.paddingXS,
                                        }}
                                    >
                                        <Text>{s.size?.name}</Text>
                                        <Text strong>
                                            {formatPrice(s.price, { includeSymbol: true })}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* 🍧 Toppings */}
                    {product.toppings && product.toppings.length > 0 && (
                        <>
                            <Divider style={{ borderColor: token.colorBorderSecondary }} />
                            <Title
                                level={5}
                                style={{
                                    color: token.colorTextHeading,
                                    marginBottom: token.marginSM,
                                }}
                            >
                                Toppings
                            </Title>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: token.marginSM,
                                }}
                            >
                                {product.toppings.map((t) => (
                                    <div
                                        key={t.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: token.marginSM,
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                            borderRadius: token.borderRadiusSM,
                                            padding: token.paddingSM,
                                            background: token.colorBgContainer,
                                        }}
                                    >
                                        <Image
                                            src={`${IMAGE_BASE_URL}/${t.image_name}`}
                                            alt={t.name}
                                            width={60}
                                            height={60}
                                            style={{
                                                objectFit: "cover",
                                                borderRadius: token.borderRadius,
                                            }}
                                        />
                                        <div>
                                            <Text>{t.name}</Text>
                                            <div>
                                                <Text type="secondary">
                                                    {t.price > 0
                                                        ? formatPrice(t.price, { includeSymbol: true })
                                                        : "Free"}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ⚙️ Option Groups */}
                    {product.optionGroups && product.optionGroups.length > 0 && (
                        <>
                            <Divider style={{ borderColor: token.colorBorderSecondary }} />
                            <Title
                                level={5}
                                style={{
                                    color: token.colorTextHeading,
                                    marginBottom: token.marginSM,
                                }}
                            >
                                Option Groups
                            </Title>

                            {product.optionGroups.map((group) => (
                                <div key={group.id} style={{ marginBottom: token.marginSM }}>
                                    <Text strong>{group.name}</Text>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: token.marginXS,
                                            marginTop: token.marginXXS,
                                        }}
                                    >
                                        {group.values?.map((v) => (
                                            <Tag key={v.id} color={token.colorPrimary}>
                                                {v.name}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </>
            ) : (
                <Text type="secondary">No product details available.</Text>
            )}
        </Modal>
    );
}
