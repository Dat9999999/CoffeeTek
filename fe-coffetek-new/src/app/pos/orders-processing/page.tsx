"use client";

import React, { useState, useEffect } from "react";
import { Layout, theme, Card, Typography, Flex } from "antd";
import { orderService } from "@/services/orderService";
import type { Order } from "@/interfaces";
import { OrderStatus } from "@/interfaces";
import { KitchenOrderDisplay } from "@/components/features/orders/KitchenOrderDisplay";
import { OrderQueue } from "@/components/features/orders/OrderQueue";
import { getSocketInstance } from "@/lib/socket";

const { Content } = Layout;
const { Text } = Typography;

export default function OrdersPage() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const { token } = theme.useToken();
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
        
        // Use shared socket instance to prevent duplicate connections
        const socket = getSocketInstance();
        
        const handleNewOrder = () => {
            fetchOrders();
        };
        
        const handleProcessOrderCount = () => {
            fetchOrders();
        };
        
        socket.on("newOrder", handleNewOrder);
        socket.on("processOrderCount", handleProcessOrderCount);
        
        return () => {
            // Clean up listeners to prevent duplicates (but don't disconnect shared socket)
            socket.off("newOrder", handleNewOrder);
            socket.off("processOrderCount", handleProcessOrderCount);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await orderService.getAll({
                searchStatuses: "paid,pending",
                page: 1,
                size: 100,
                orderBy: "created_at",
                orderDirection: "asc", // Oldest first for kitchen queue
            });
            const ordersData = res.data || res;
            setOrders(ordersData);
            
            // Auto-select first order if none selected
            if (!selectedOrderId && ordersData.length > 0) {
                setSelectedOrderId(ordersData[0].id);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const selectedOrder = orders.find(o => o.id === selectedOrderId);
    // Show all orders in queue (excluding selected one)
    const queueOrders = orders.filter(o => o.id !== selectedOrderId);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            await orderService.updateStatus({
                orderId,
                status: newStatus,
            });
            
            // Refresh orders
            await fetchOrders();
            
            // Auto-select next order if current one is completed/canceled
            if (newStatus === OrderStatus.COMPLETED || newStatus === OrderStatus.CANCELED) {
                const remainingOrders = orders.filter(o => 
                    o.id !== orderId && 
                    (o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID)
                );
                if (remainingOrders.length > 0) {
                    setSelectedOrderId(remainingOrders[0].id);
                } else {
                    setSelectedOrderId(null);
                }
            }
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", position: "relative" }}>
                <Content
                    style={{
                        padding: isMobile ? 12 : 24,
                        margin: 0,
                        minHeight: "100vh",
                        background: token.colorBgContainer,
                    }}
                >
                    {/* Kitchen-Friendly Layout */}
                    <div style={{ 
                        display: "flex", 
                        flexDirection: isMobile ? "column" : "row", 
                        gap: 24, 
                        height: "calc(100vh - 48px)",
                        maxHeight: "calc(100vh - 48px)",
                    }}>
                        {/* Main Order Display - Takes 65% on desktop */}
                        <div style={{ 
                            flex: isMobile ? "1" : "0 0 65%", 
                            minWidth: 0,
                            overflowY: "auto",
                        }}>
                            {selectedOrder ? (
                                <KitchenOrderDisplay
                                    order={selectedOrder}
                                    onStatusChange={handleStatusChange}
                                />
                            ) : (
                                <Card>
                                    <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
                                        <Text type="secondary" style={{ fontSize: 18 }}>
                                            {orders.length === 0 
                                                ? "No orders to process" 
                                                : "Select an order to view details"}
                                        </Text>
                                    </Flex>
                                </Card>
                            )}
                        </div>

                        {/* Order Queue - Takes 35% on desktop, scrollable */}
                        <div style={{ 
                            flex: isMobile ? "1" : "0 0 35%", 
                            minWidth: 0,
                            maxHeight: "100%",
                            overflow: "hidden",
                        }}>
                            <OrderQueue
                                orders={queueOrders}
                                selectedOrderId={selectedOrderId}
                                onSelectOrder={setSelectedOrderId}
                                loading={loadingOrders}
                            />
                        </div>
                    </div>
                </Content>
        </Layout>
    );
}
