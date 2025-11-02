"use client";

import { useEffect, useRef, useState } from "react";
import {
    Modal,
    Descriptions,
    Carousel,
    Spin,
    Typography,
    Divider,
    Tag,
    theme,
    Tabs,
    Table,
    Flex,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { CarouselRef } from "antd/es/carousel";
import { productService } from "@/services/productService";
import { recipeService, type RecipeByProductId, type MaterialRecipeItem } from "@/services/recipeService";
import type { ProductDetail } from "@/interfaces";
import { formatPrice } from "@/utils";
import { AppImageSize } from "@/components/commons";

const { Title, Text: AntText } = Typography;
const { TabPane } = Tabs;

interface ProductDetailModalProps {
    open: boolean;
    recordId?: number;
    onClose: () => void;
}

interface RecipeItem {
    material: MaterialRecipeItem["Material"];
    consume: {
        sizeId: number | null;
        amount: number;
    }[];
}

export function ProductDetailModal({
    open,
    recordId,
    onClose,
}: ProductDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [recipe, setRecipe] = useState<RecipeByProductId | null>(null);
    const carouselRef = useRef<CarouselRef>(null);
    const { token } = theme.useToken();

    useEffect(() => {
        if (!recordId || !open) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const [productRes, recipeRes] = await Promise.all([
                    productService.getById(recordId),
                    recipeService.getByProductId(recordId).catch(() => null), // Handle no recipe case
                ]);
                setProduct(productRes);
                setRecipe(recipeRes);
            } catch (error) {
                console.error("Failed to load product detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [recordId, open]);

    const renderRecipeTable = () => {
        if (!recipe || recipe.MaterialRecipe.length === 0) {
            return <AntText type="secondary">No recipe available.</AntText>;
        }

        const isMultiSize = product?.is_multi_size ?? false;
        const sizes = isMultiSize
            ? (product?.sizes ?? []).map((s) => ({ id: s.size.id, name: s.size.name }))
            : [{ id: null, name: "Default" }];

        // Group MaterialRecipe by materialId
        const materialMap = new Map<number, RecipeItem>();
        recipe.MaterialRecipe.forEach((mr) => {
            const mid = mr.materialId;
            if (!materialMap.has(mid)) {
                materialMap.set(mid, {
                    material: mr.Material,
                    consume: [],
                });
            }
            const item = materialMap.get(mid)!;
            item.consume.push({ sizeId: mr.sizeId, amount: mr.consume });
        });
        const dataSource = Array.from(materialMap.values());

        const columns = [
            {
                title: "Used materials",
                key: "material",
                fixed: "left" as const,
                render: (item: RecipeItem) => (
                    <AntText strong>
                        {item.material.name} ({item.material.Unit?.symbol || ""})
                    </AntText>
                ),
            },
            ...(isMultiSize
                ? [
                    {
                        title: "Usage per Size",
                        children: sizes.map((size) => ({
                            title: size.name,
                            key: `consume_${size.id}`,
                            align: "center" as const,
                            render: (item: RecipeItem) => {
                                const consumeEntry = item.consume.find((c) => c.sizeId === size.id);
                                const amount = consumeEntry?.amount || 0;
                                return <AntText>{amount}</AntText>;
                            },
                        })),
                    },
                ]
                : [
                    {
                        title: "Consume",
                        key: "consume",
                        align: "center" as const,
                        render: (item: RecipeItem) => {
                            const amount = item.consume[0]?.amount || 0;
                            return <AntText>{amount}</AntText>;
                        },
                    },
                ]),
        ];

        return (
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey={(item) => item.material.id}
                scroll={{ x: "max-content" }}
            />
        );
    };

    const renderInfoContent = () => {
        if (!product) return <AntText type="secondary">No product details available.</AntText>;

        if (product.isTopping) {
            return (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{product.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{product.name}</Descriptions.Item>
                    <Descriptions.Item label="Type">Topping</Descriptions.Item>
                    <Descriptions.Item label="Price">
                        {formatPrice(product.price ?? 0, { includeSymbol: true })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Image">
                        {product.images && product.images.length > 0 ? (
                            <AppImageSize
                                src={product.images[0].image_name}
                                alt={product.name}
                                width={200}
                                height={200}
                                style={{ objectFit: "contain", borderRadius: token.borderRadius }}
                            />
                        ) : (
                            "No image"
                        )}
                    </Descriptions.Item>
                </Descriptions>
            );
        }

        return (
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
                            textAlign: "center"
                        }}
                    >
                        <Carousel ref={carouselRef} autoplay={false}>
                            {product.images.map((img) => (
                                <Flex
                                    align="center"
                                    justify="center"
                                    className="abc"
                                    key={img.image_name}
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        background: token.colorBgContainer,
                                    }}
                                >
                                    <AppImageSize
                                        className="mx-auto"
                                        src={img.image_name}
                                        alt={img.image_name}
                                        width={200}
                                        height={200}
                                        style={{
                                            objectFit: "cover",
                                            borderRadius: token.borderRadius,
                                        }}
                                    />
                                </Flex>
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
                        No image found
                    </div>
                )}

                {/* 🧾 Info */}
                <Descriptions bordered column={2} size="small" style={{ marginBottom: token.marginLG }}>
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
                        <Divider />
                        <Title level={5}>Available Sizes</Title>
                        <div style={{
                            background: token.colorBgContainer,
                            padding: token.paddingSM,
                            borderRadius: token.borderRadiusSM,
                            boxShadow: token.boxShadowSecondary,
                        }}>
                            {product.sizes.map((s) => (
                                <div
                                    key={s.size.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                                        paddingBlock: token.paddingXS,
                                    }}
                                >
                                    <AntText>{s.size?.name}</AntText>
                                    <AntText strong>
                                        {formatPrice(s.price, { includeSymbol: true })}
                                    </AntText>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 🍧 Toppings */}
                {product.toppings && product.toppings.length > 0 && (
                    <>
                        <Divider />
                        <Title level={5}>Toppings</Title>
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
                                    <AppImageSize
                                        src={t.image_name}
                                        alt={t.name}
                                        width={60}
                                        height={60}
                                        style={{ borderRadius: token.borderRadius }}
                                    />
                                    <div>
                                        <AntText>{t.name}</AntText>
                                        <div>
                                            <AntText type="secondary">
                                                {t.price > 0
                                                    ? formatPrice(t.price, { includeSymbol: true })
                                                    : "Free"}
                                            </AntText>
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
                        <Divider />
                        <Title level={5}>Option Groups</Title>
                        {product.optionGroups.map((group) => (
                            <div key={group.id} style={{ marginBottom: token.marginSM }}>
                                <AntText strong>{group.name}</AntText>
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
        );
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>{!product?.isTopping ? "Product Details" : "Topping Details"}</Title>}
            open={open}
            onCancel={onClose}
            onOk={onClose}
            width={800}
            centered
        >
            {loading ? (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBlock: token.paddingXL,
                }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Tabs defaultActiveKey="info">
                    <TabPane key="info" tab="Info">
                        {renderInfoContent()}
                    </TabPane>
                    <TabPane key="recipe" tab="Recipe">
                        {renderRecipeTable()}
                    </TabPane>
                </Tabs>
            )}
        </Modal>
    );
}