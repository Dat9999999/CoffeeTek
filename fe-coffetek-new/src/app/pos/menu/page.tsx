"use client";

import React, { useState, useEffect } from "react";
import {
    Layout,
    Card,
    Typography,
    Button,
    Tag,
    Space,
    Spin,
    Input,
    Empty,
    message,
    theme,
    Row,
    Col,
    Switch,
    Divider,
} from "antd";
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import type { Product } from "@/interfaces";
import type { Category } from "@/interfaces";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function KitchenMenuPage() {
    const { token } = theme.useToken();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAll({ page: 1, size: 100 });
            const cats = res.data || res;
            setCategories(cats);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productService.getAll({
                page: 1,
                size: 1000, // Get all products for kitchen
                isTopping: false, // Only show regular products, not toppings
            });
            const productsData = res.data || res;
            setProducts(productsData);
        } catch (err) {
            console.error("Error fetching products:", err);
            message.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        const currentStatus = product.isActive ?? true; // Default to true if undefined
        const newStatus = !currentStatus;
        setTogglingIds((prev) => new Set(prev).add(product.id));

        try {
            await productService.toggleActiveStatus(product.id, newStatus);
            
            // Update local state
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === product.id ? { ...p, isActive: newStatus } : p
                )
            );

            message.success(
                `${product.name} has been ${newStatus ? "enabled" : "disabled"}`
            );
        } catch (err) {
            console.error("Error toggling product status:", err);
            message.error("Failed to update product status");
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }
    };

    // Filter products by search query
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group products by category
    const productsByCategory = filteredProducts.reduce((acc, product) => {
        const categoryName = product.category?.name || "Uncategorized";
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const sortedCategories = Object.keys(productsByCategory).sort();

    return (
        <Layout style={{ minHeight: "100vh", background: token.colorBgContainer }}>
            <Content
                style={{
                    padding: 24,
                    maxWidth: 1400,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        Kitchen Menu Management
                    </Title>
                    <Text type="secondary">
                        Enable or disable products when materials run out
                    </Text>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Input
                        size="large"
                        placeholder="Search products..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </Card>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <Spin size="large" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <Empty description="No products found" />
                ) : (
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        {sortedCategories.map((categoryName) => (
                            <Card
                                key={categoryName}
                                title={
                                    <Space>
                                        <span>{categoryName}</span>
                                        <Tag color="blue">
                                            {productsByCategory[categoryName].length} products
                                        </Tag>
                                    </Space>
                                }
                                style={{ width: "100%" }}
                            >
                                <Row gutter={[16, 16]}>
                                    {productsByCategory[categoryName].map((product) => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                            <Card
                                                size="small"
                                                style={{
                                                    border: `1px solid ${token.colorBorderSecondary}`,
                                                    height: "100%",
                                                }}
                                                bodyStyle={{ padding: 12 }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "flex-start",
                                                        }}
                                                    >
                                                        <Text strong style={{ fontSize: 14 }}>
                                                            {product.name}
                                                        </Text>
                                                        <Tag
                                                            color={(product.isActive ?? true) ? "success" : "error"}
                                                            icon={
                                                                (product.isActive ?? true) ? (
                                                                    <CheckCircleOutlined />
                                                                ) : (
                                                                    <CloseCircleOutlined />
                                                                )
                                                            }
                                                        >
                                                            {(product.isActive ?? true) ? "Active" : "Disabled"}
                                                        </Tag>
                                                    </div>

                                                    <Divider style={{ margin: "8px 0" }} />

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Status:
                                                        </Text>
                                                        <Switch
                                                            checked={product.isActive ?? true}
                                                            onChange={() => handleToggleStatus(product)}
                                                            disabled={togglingIds.has(product.id)}
                                                            loading={togglingIds.has(product.id)}
                                                            checkedChildren="ON"
                                                            unCheckedChildren="OFF"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        ))}
                    </Space>
                )}
            </Content>
        </Layout>
    );
}
