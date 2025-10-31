"use client";

import React, { useState, useEffect } from "react";
import { Layout, theme, Button } from "antd";
import LeftSider from "./LeftSider";
import { useDarkMode } from "@/components/providers";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { orderService } from "@/services/orderService";
import type { Order } from "@/interfaces";
import { OrderDetailComponent } from "@/components/features/orders";

const { Sider, Content } = Layout;

export default function OrdersPage() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const { token } = theme.useToken();
    const { mode } = useDarkMode(); // Not directly used here, but kept for consistency
    const [collapsed, setCollapsed] = useState(typeof window !== "undefined" && window.innerWidth < 992);
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await orderService.getAll({
                searchStatuses: "paid,pending",
                page: 1,
                size: 100,
                orderBy: "created_at",
                orderDirection: "desc",
            });
            setOrders(res.data || res);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", position: "relative" }}>
            <LeftSider
                onSelect={setSelectedOrderId}
                defaultSelected={selectedOrderId}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                collapsedWidth={isMobile ? 0 : 70}
                style={{
                    position: isMobile ? "fixed" : undefined,
                    left: isMobile ? 0 : undefined,
                    top: isMobile ? 0 : undefined,
                    height: isMobile ? "100vh" : undefined,
                    zIndex: isMobile ? 1000 : undefined,
                }}
                orders={orders}
                loading={loadingOrders}
            />
            <Layout style={{ width: "100%" }}>
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 300,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    {isMobile && (
                        <Button
                            type="text"
                            icon={<MenuUnfoldOutlined />}
                            onClick={() => setCollapsed(false)}
                            style={{ marginBottom: 16 }}
                        >

                        </Button>
                    )}
                    <OrderDetailComponent header={null} orderId={selectedOrderId} onStatusUpdate={fetchOrders} />
                </Content>
            </Layout>
        </Layout>
    );
}