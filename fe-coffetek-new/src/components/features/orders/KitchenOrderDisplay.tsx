"use client";

import React from "react";
import {
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Divider,
    Flex,
    Badge,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { Order, OrderStatus } from "@/interfaces";
import { formatPrice, getStatusColor } from "@/utils";
import dayjs from "dayjs";
import { AppImageSize } from "@/components/commons";

const { Title, Text } = Typography;

interface KitchenOrderDisplayProps {
    order: Order;
    onStatusChange: (orderId: number, newStatus: OrderStatus) => Promise<void>;
}

export function KitchenOrderDisplay({ order, onStatusChange }: KitchenOrderDisplayProps) {
    const [updating, setUpdating] = React.useState(false);

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        setUpdating(true);
        try {
            await onStatusChange(order.id, newStatus);
            message.success(`Order #${order.id} updated to ${newStatus.toUpperCase()}`);
        } catch (err) {
            message.error("Failed to update order status");
        } finally {
            setUpdating(false);
        }
    };

    const getNextStatus = (): OrderStatus | null => {
        if (order.status === OrderStatus.PENDING) return OrderStatus.PAID;
        if (order.status === OrderStatus.PAID) return OrderStatus.COMPLETED;
        return null;
    };

    const nextStatus = getNextStatus();
    const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.PAID;

    // Calculate total items
    const totalItems = order.order_details.reduce((sum, detail) => sum + detail.quantity, 0);

    return (
        <Card
            style={{
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: 24 }}
        >
            {/* Header */}
            <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontSize: 32 }}>
                        Order #{order.id}
                    </Title>
                    <Space style={{ marginTop: 8 }}>
                        <Tag color={getStatusColor(order.status)} style={{ fontSize: 14, padding: "4px 12px" }}>
                            {order.status.toUpperCase()}
                        </Tag>
                        <Text type="secondary">
                            {dayjs(order.created_at).format("HH:mm")} • {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </Text>
                    </Space>
                </div>
            </Flex>

            <Divider />

            {/* Customer Info */}
            {order.customerPhone && (
                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ fontSize: 16 }}>Customer: </Text>
                    <Text style={{ fontSize: 16 }}>
                        {order.Customer
                            ? `${order.Customer.first_name ?? ""} ${order.Customer.last_name ?? ""}`
                            : order.customerPhone}
                    </Text>
                </div>
            )}

            {/* Note */}
            {order.note && (
                <div style={{ 
                    marginBottom: 20, 
                    padding: 12, 
                    background: "#fff7e6", 
                    borderRadius: 8,
                    border: "1px solid #ffd591"
                }}>
                    <Text strong style={{ fontSize: 14, color: "#d46b08" }}>Note: </Text>
                    <Text style={{ fontSize: 14 }}>{order.note}</Text>
                </div>
            )}

            <Divider />

            {/* Order Items - Kitchen Focus */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16, fontSize: 20 }}>
                    Items to Prepare
                </Title>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {order.order_details.map((detail, index) => {
                        const toppings = detail.ToppingOrderDetail || [];
                        const options = detail.optionValue || [];
                        const sizeText = detail.size ? detail.size.name : "";
                        const productImage =
                            detail.product?.images?.[0]?.image_name || "/no-image.png";

                        return (
                            <Card
                                key={detail.id}
                                size="small"
                                style={{
                                    background: index === 0 ? "#f6ffed" : "#fafafa",
                                    border: index === 0 ? "2px solid #52c41a" : "1px solid #d9d9d9",
                                }}
                            >
                                <Flex gap={16} align="flex-start">
                                    {/* Product Image */}
                                    <AppImageSize
                                        width={80}
                                        height={80}
                                        alt={detail.product_name}
                                        src={productImage}
                                        style={{ 
                                            objectFit: "cover",
                                            borderRadius: 8,
                                            border: "1px solid #d9d9d9"
                                        }}
                                    />

                                    {/* Product Info */}
                                    <div style={{ flex: 1 }}>
                                        <Flex justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
                                            <div>
                                                <Title level={5} style={{ margin: 0, fontSize: 18 }}>
                                                    {detail.product_name}
                                                </Title>
                                                {sizeText && (
                                                    <Tag color="blue" style={{ marginTop: 4 }}>
                                                        Size: {sizeText}
                                                    </Tag>
                                                )}
                                            </div>
                                            <Badge
                                                count={detail.quantity}
                                                style={{ backgroundColor: "#52c41a" }}
                                            />
                                        </Flex>

                                        {/* Toppings */}
                                        {toppings.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong style={{ fontSize: 12, color: "#595959" }}>
                                                    Toppings:{" "}
                                                </Text>
                                                <Text style={{ fontSize: 12 }}>
                                                    {toppings
                                                        .map(
                                                            (top) =>
                                                                `${top.topping?.name} (x${top.quantity})`
                                                        )
                                                        .join(", ")}
                                                </Text>
                                            </div>
                                        )}

                                        {/* Options */}
                                        {options.length > 0 && (
                                            <div style={{ marginTop: 4 }}>
                                                <Text strong style={{ fontSize: 12, color: "#595959" }}>
                                                    Options:{" "}
                                                </Text>
                                                <Text style={{ fontSize: 12 }}>
                                                    {options
                                                        .map((opt) => opt.name)
                                                        .join(", ")}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </Flex>
                            </Card>
                        );
                    })}
                </Space>
            </div>

            <Divider />

            {/* Quick Action Buttons */}
            <Flex gap={12} wrap="wrap">
                {nextStatus && (
                    <Button
                        type="primary"
                        size="large"
                        icon={<CheckOutlined />}
                        onClick={() => handleStatusUpdate(nextStatus)}
                        loading={updating}
                        style={{
                            flex: 1,
                            minWidth: 200,
                            height: 56,
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        {order.status === OrderStatus.PENDING
                            ? "Mark as Paid"
                            : "Mark as Completed"}
                    </Button>
                )}

                {canCancel && (
                    <Button
                        danger
                        size="large"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleStatusUpdate(OrderStatus.CANCELED)}
                        loading={updating}
                        style={{
                            flex: 1,
                            minWidth: 200,
                            height: 56,
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        Cancel Order
                    </Button>
                )}
            </Flex>

            {/* Price Summary */}
            <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                    <Text strong>Total:</Text>
                    <Text strong style={{ fontSize: 18 }}>
                        {formatPrice(order.final_price, { includeSymbol: true })}
                    </Text>
                </Flex>
            </div>
        </Card>
    );
}

