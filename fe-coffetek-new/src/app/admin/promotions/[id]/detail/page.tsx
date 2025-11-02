"use client";

import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Typography,
    Space,
    theme,
    Flex,
    Card,
    Row,
    Col,
} from "antd";
import { promotionService } from "@/services/promotionService";
import { Product, Size } from "@/interfaces";
import dayjs from "dayjs";
import { formatPrice } from "@/utils";
import {
    ArrowLeftOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { AppImage, AppImageSize } from "@/components/commons";
import { message } from "antd";

const { Text, Title } = Typography;

export default function PromotionDetailPage() {
    const { token } = theme.useToken();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [promotion, setPromotion] = useState<any>(null); // Use any to match API response structure
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [productNewPrices, setProductNewPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const data = await promotionService.getById(Number(id));
                setPromotion(data);

                const productsMap = new Map<number, Product>();
                const newPrices: Record<string, number> = {};

                data.ProductPromotion.forEach((pp: any) => {
                    const product = pp.Product;
                    productsMap.set(product.id, product);

                    // Assume productSizedId may be present; fallback to null
                    const psId = pp.productSizedId ?? null;
                    const key = psId ? `${product.id}-${psId}` : `${product.id}-default`;
                    newPrices[key] = pp.new_price;
                });

                setSelectedProducts(Array.from(productsMap.values()));
                setProductNewPrices(newPrices);
            } catch (err) {
                message.error("Failed to load promotion details.");
                router.push("/admin/promotions");
            }
        };

        fetchPromotion();
    }, [id, router]);

    if (!promotion) {
        return <div>Loading...</div>;
    }

    const allSizes = new Set<string>();
    selectedProducts.forEach((p) => {
        if (p.is_multi_size && !p.isTopping && p.sizes) {
            p.sizes.forEach((ps) => allSizes.add(ps.size.name));
        }
    });
    const sortedSizes = Array.from(allSizes).sort();
    const hasMultiSize = selectedProducts.some(
        (p) => p.is_multi_size && !p.isTopping && p.sizes && p.sizes.length > 0
    );

    const priceColumn = hasMultiSize
        ? {
            title: "Price",
            children: sortedSizes.map((sizeName, i) => ({
                title: sizeName,
                key: sizeName,
                render: (record: Product) => {
                    if (!record.is_multi_size || record.isTopping) {
                        if (i === 0) {
                            const key = `${record.id}-default`;
                            const oldPrice = record.price ?? 0;
                            const newPrice = productNewPrices[key] ?? oldPrice;
                            const percentChange =
                                oldPrice === 0
                                    ? "0.00"
                                    : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                            const isChanged = newPrice < oldPrice;

                            return {
                                children: (
                                    <Space>
                                        {isChanged && (
                                            <Text delete>
                                                {formatPrice(oldPrice, { includeSymbol: true })}
                                            </Text>
                                        )}
                                        <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                                        {isChanged && (
                                            <Space size={4}>
                                                <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                                <Text type="success">{percentChange}%</Text>
                                            </Space>
                                        )}
                                    </Space>
                                ),
                                props: { colSpan: sortedSizes.length },
                            };
                        } else {
                            return { children: null, props: { colSpan: 0 } };
                        }
                    }

                    const ps = record.sizes?.find((s) => s.size.name === sizeName);
                    const key = ps ? `${record.id}-${ps.id}` : `${record.id}-default`;
                    const oldPrice = ps?.price ?? record.price ?? 0;
                    const newPrice = productNewPrices[key] ?? oldPrice;
                    const percentChange =
                        oldPrice === 0 ? "0.00" : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                    const isChanged = newPrice < oldPrice;

                    return (
                        <Space>
                            {isChanged && (
                                <Text delete>
                                    {formatPrice(oldPrice, { includeSymbol: true })}
                                </Text>
                            )}
                            <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                            {isChanged && (
                                <Space size={4}>
                                    <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                    <Text type="success">{percentChange}%</Text>
                                </Space>
                            )}
                        </Space>
                    );
                },
            })),
        }
        : {
            title: "Price",
            key: "price",
            render: (record: Product) => {
                const key = `${record.id}-default`;
                const oldPrice = record.price ?? 0;
                const newPrice = productNewPrices[key] ?? oldPrice;
                const percentChange =
                    oldPrice === 0 ? "0.00" : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                const isChanged = newPrice < oldPrice;
                return (
                    <Space>
                        {isChanged && <Text delete>{formatPrice(oldPrice, { includeSymbol: true })}</Text>}
                        <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                        {isChanged && (
                            <Space size={4}>
                                <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                <Text type="success">{percentChange}%</Text>
                            </Space>
                        )}
                    </Space>
                );
            },
        };

    const selectedProductsColumns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (_: any, record: Product) => {
                const imageSrc = record?.images?.[0]?.image_name || "/placeholder.png";
                return (
                    <Space size={"middle"}>

                        <AppImageSize preview={false} src={imageSrc} alt={record.name} width={40} height={40} />
                        <span>{record.name}</span>
                    </Space>
                );
            },
        },
        priceColumn,
    ];

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Header */}
            <Flex align="center" justify="space-between" wrap style={{ marginBottom: 24 }}>
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => router.push("/admin/promotions")}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        Promotion Details
                    </Title>
                </Space>
            </Flex>

            {/* Content */}
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <Card title="Promotion Details" bordered={false} style={{ marginBottom: 32 }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Text strong>Promotion Name</Text>
                            <p>{promotion.name}</p>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Text strong>Valid Period</Text>
                            <p>
                                {dayjs(promotion.start_date).format("DD/MM/YYYY")} -{" "}
                                {dayjs(promotion.end_date).format("DD/MM/YYYY")}
                            </p>
                        </Col>
                        <Col span={24}>
                            <Text strong>Description</Text>
                            <p>{promotion.description}</p>
                        </Col>
                    </Row>
                </Card>

                {/* Table */}
                <Card title="Products in this Promotion" bordered={false}>
                    <Table
                        bordered
                        columns={selectedProductsColumns}
                        dataSource={selectedProducts}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: "max-content" }}
                        locale={{ emptyText: "No products in this promotion" }}
                    />
                </Card>
            </div>
        </div>
    );
}