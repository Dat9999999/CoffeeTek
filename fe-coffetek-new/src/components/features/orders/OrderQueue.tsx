"use client";

import React from "react";
import {
    Card,
    Typography,
    Tag,
    Space,
    Flex,
    Spin,
    Empty,
    Badge,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Order } from "@/interfaces";
import { getStatusColor } from "@/utils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface OrderQueueProps {
    orders: Order[];
    selectedOrderId: number | null;
    onSelectOrder: (orderId: number) => void;
    loading?: boolean;
}

export function OrderQueue({
    orders,
    selectedOrderId,
    onSelectOrder,
    loading = false,
}: OrderQueueProps) {
    if (loading) {
        return (
            <Card>
                <Flex align="center" justify="center" style={{ minHeight: 200 }}>
                    <Spin size="large" />
                </Flex>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text type="secondary">No more orders in queue</Text>}
                />
            </Card>
        );
    }

    return (
        <Card
            title={
                <Flex align="center" gap={8}>
                    <ClockCircleOutlined />
                    <Title level={4} style={{ margin: 0 }}>
                        All Orders ({orders.length})
                    </Title>
                </Flex>
            }
            style={{ 
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
            bodyStyle={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                padding: 16,
            }}
        >
            <div style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 8,
            }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    {orders.map((order, index) => {
                        const totalItems = order.order_details.reduce(
                            (sum, detail) => sum + detail.quantity,
                            0
                        );
                        const isSelected = order.id === selectedOrderId;
                        const timeAgo = dayjs().diff(dayjs(order.created_at), "minute");

                        return (
                            <Card
                                key={order.id}
                                hoverable
                                onClick={() => onSelectOrder(order.id)}
                                style={{
                                    cursor: "pointer",
                                    border: isSelected
                                        ? "2px solid #1890ff"
                                        : "1px solid #d9d9d9",
                                    background: isSelected ? "#e6f7ff" : "#fff",
                                    transition: "all 0.2s",
                                }}
                                bodyStyle={{ padding: 16 }}
                            >
                                <Flex justify="space-between" align="flex-start">
                                    <div style={{ flex: 1 }}>
                                        <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                                            <Badge
                                                count={index + 1}
                                                style={{
                                                    backgroundColor: isSelected ? "#1890ff" : "#8c8c8c",
                                                }}
                                            />
                                            <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                                                Order #{order.id}
                                            </Title>
                                        </Flex>

                                        <Space size={8} style={{ marginBottom: 8 }}>
                                            <Tag color={getStatusColor(order.status)}>
                                                {order.status.toUpperCase()}
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {totalItems} item{totalItems !== 1 ? "s" : ""}
                                            </Text>
                                        </Space>

                                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                            {dayjs(order.created_at).format("HH:mm")} • {timeAgo}m ago
                                        </Text>
                                    </div>
                                </Flex>
                            </Card>
                        );
                    })}
                </Space>
            </div>
        </Card>
    );
}

