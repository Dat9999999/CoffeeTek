"use client";

import React, { ReactElement, useEffect, useState } from "react";
import {
    Descriptions,
    Collapse,
    Typography,
    Flex,
    Divider,
    Spin,
    message,
    Tag,
    Button,
} from "antd";
import {
    CheckOutlined,
    DownOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AppImageSize } from "@/components/commons";
import { formatPrice, getStatusColor } from "@/utils";
import {
    Order,
    OrderDetail,
    ToppingOrderDetail,
    OrderStatus,
} from "@/interfaces";
import { orderService } from "@/services/orderService";
import { Grid } from "antd";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface OrderDetailComponentProps {
    orderId: number | null;
    onStatusUpdate?: () => void;

    activeConfirmButton?: boolean;
    header: ReactElement | null;
}

export function OrderDetailComponent({
    orderId,
    onStatusUpdate,
    activeConfirmButton = true,
    header = null
}: OrderDetailComponentProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const screens = Grid.useBreakpoint();

    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            return;
        }

        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await orderService.getById(orderId!);
            setOrder(res);
        } catch (err) {
            message.error("Error getting order detail.");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!order) return;
        const newStatus =
            order.status === OrderStatus.PENDING
                ? OrderStatus.PAID
                : OrderStatus.COMPLETED;

        try {
            await orderService.updateStatus({
                orderId: order.id,
                status: newStatus,
            });
            message.success(`Order updated to ${newStatus.toUpperCase()} successfully`);
            fetchOrder();
            onStatusUpdate?.();
        } catch (err) {
            message.error("Error updating order status");
        }
    };

    const handleCancel = async () => {
        if (!order) return;
        try {
            await orderService.updateStatus({
                orderId: order.id,
                status: OrderStatus.CANCELED,
            });
            message.success("Order canceled successfully");
            fetchOrder();
            onStatusUpdate?.();
        } catch (err) {
            message.error("Error canceling order");
        }
    };

    if (loading) {
        return (
            <Flex align="center" justify="center" style={{ height: "80vh" }}>
                <Spin size="large" />
            </Flex>
        );
    }

    if (!orderId || !order) {
        return (
            <Flex vertical align="center" justify="center" style={{ height: "80vh" }}>
                <Text type="secondary">
                    {orderId
                        ? `Order #${orderId} not found`
                        : "Please select an order to view details"}
                </Text>
            </Flex>
        );
    }

    const handleGetInvoice = async () => {
        try {
            const invoiceUrl = await orderService.getInvoice(Number(order.id));
            window.open(invoiceUrl, "_blank");
        } catch (err) {
            message.error("Error getting invoice.");
        }
    };

    const canConfirm =
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.PAID;
    const canCancel =
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.PAID;

    const confirmText =
        order.status === OrderStatus.PENDING
            ? "Confirm Paid"
            : "Confirm Complete";

    return (
        <div>
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>

                {header ? (
                    header
                ) : (

                    <Title level={3} style={{ marginBottom: 0 }}>
                        {`Order #${order.id} Details`}
                    </Title>
                )}
                {canConfirm && activeConfirmButton && (
                    <Button
                        icon={<CheckOutlined />}
                        type="primary"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                )}


            </Flex>

            {/* ===== ORDER INFO ===== */}
            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Created At">
                    {dayjs(order.created_at).format("DD-MM-YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                    {order.Customer
                        ? `${order.Customer.first_name ?? ""} ${order.Customer.last_name ?? ""} (${order.customerPhone ?? "N/A"})`
                        : "Guest"}
                </Descriptions.Item>
                <Descriptions.Item label="Order Processor">
                    {order.Staff
                        ? `${order.Staff.first_name ?? ""} ${order.Staff.last_name ?? ""} (${order.Staff.phone_number ?? "N/A"})`
                        : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Original Price">
                    {formatPrice(order.original_price, { includeSymbol: true })}
                </Descriptions.Item>
                <Descriptions.Item label="Final Price">
                    {formatPrice(order.final_price, { includeSymbol: true })}
                </Descriptions.Item>
                <Descriptions.Item label="Note">
                    {order.note || "N/A"}
                </Descriptions.Item>
            </Descriptions>

            {/* ===== ORDER ITEMS ===== */}
            <Title level={4} style={{ marginTop: 16 }}>
                Order Items
            </Title>

            <Collapse
                accordion
                expandIconPosition="start"
                expandIcon={({ isActive }) => (
                    <Flex vertical justify="center" align="center" style={{ height: "100%" }}>
                        <DownOutlined
                            rotate={isActive ? 180 : 0}
                            style={{ transition: "0.3s" }}
                        />
                    </Flex>
                )}
            >
                {order.order_details.map((detail: OrderDetail, index: number) => {
                    const toppings = detail.ToppingOrderDetail || [];
                    const options = detail.optionValue || [];
                    const sizeText = detail.size ? detail.size.name : "—";
                    const productImage =
                        detail.product?.images?.[0]?.image_name || "/no-image.png";

                    // subtotal tổng cho product + toppings
                    const productTotal = detail.unit_price * detail.quantity;
                    const toppingTotal = toppings.reduce(
                        (sum, top) => sum + top.unit_price * top.quantity * detail.quantity,
                        0
                    );
                    const subtotal = productTotal + toppingTotal;
                    const total_unit_price = detail.unit_price + toppings.reduce(
                        (sum, top) => sum + top.unit_price * top.quantity,
                        0
                    );;
                    const descriptionParts: string[] = [];
                    if (toppings.length > 0) {
                        const toppingSummary = toppings
                            .map(top => `${top.topping?.name} (x${top.quantity} per unit)`)
                            .join(", ");
                        descriptionParts.push(toppingSummary);
                    }
                    if (options.length > 0)
                        descriptionParts.push(
                            options
                                .map(
                                    (opt) =>
                                        `${opt.option_group?.name || "Option"}: ${opt.name}`
                                )
                                .join(", ")
                        );

                    return (
                        <Panel
                            key={detail.id}
                            header={
                                <Flex
                                    justify={screens.sm ? "space-between" : "flex-start"}
                                    align={screens.sm ? "center" : "stretch"}
                                    wrap="wrap"
                                    vertical={!screens.sm}
                                    style={{
                                        width: "100%",
                                        rowGap: 8,
                                    }}
                                >
                                    {/* === LEFT: Ảnh + Tên sản phẩm === */}
                                    <Flex
                                        gap={8}
                                        align="center"
                                        style={{
                                            flex: screens.sm ? "1 1 30%" : "1 1 100%",
                                            minWidth: screens.sm ? 180 : 0,
                                        }}
                                    >
                                        <AppImageSize
                                            width={45}
                                            height={45}
                                            alt={detail.product_name}
                                            src={productImage}
                                            style={{ objectFit: "cover" }}
                                        />
                                        <Text strong>
                                            {index + 1}. {detail.product_name}
                                        </Text>
                                    </Flex>

                                    {/* === CENTER: Mô tả === */}
                                    <Flex
                                        justify={screens.sm ? "center" : "flex-start"}
                                        align="center"
                                        style={{
                                            flex: screens.sm ? "1 1 40%" : "1 1 100%",
                                            minWidth: screens.sm ? 200 : 0,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        <Text type="secondary">
                                            {descriptionParts.length > 0
                                                ? descriptionParts.join(" | ")
                                                : ""}
                                        </Text>
                                    </Flex>

                                    {/* === RIGHT: Size + Quantity + Subtotal === */}
                                    <Flex
                                        gap={12}
                                        align="center"
                                        style={{
                                            flex: screens.sm ? "1 1 30%" : "1 1 100%",
                                            minWidth: screens.sm ? 180 : 0,
                                            justifyContent: screens.sm ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        <Text type="success">Size: {sizeText}</Text>
                                        <Divider type="vertical" />
                                        <Text>x{detail.quantity}</Text>
                                        <Divider type="vertical" />
                                        <Text >
                                            {formatPrice(total_unit_price, {
                                                includeSymbol: true,
                                            })}/1
                                        </Text>
                                        <Divider type="vertical" />
                                        <Text strong>
                                            {formatPrice(subtotal, { includeSymbol: true })}
                                        </Text>
                                    </Flex>
                                </Flex>
                            }
                        >
                            {/* ===== PRODUCT MAIN INFO ===== */}
                            <div style={{ marginBottom: 8 }}>
                                <Title level={5} style={{ marginBottom: 4 }}>
                                    Product
                                </Title>
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    style={{
                                        padding: "4px 8px",
                                        borderBottom:
                                            toppings.length > 0
                                                ? "1px solid #f0f0f0"
                                                : "none",
                                    }}
                                >
                                    <Flex gap={8} align="center">
                                        <AppImageSize
                                            width={35}
                                            height={35}
                                            alt={detail.product_name}
                                            src={productImage}
                                            style={{ objectFit: "cover" }}
                                        />
                                        <Text>{detail.product_name}</Text>
                                    </Flex>
                                    <Flex gap={12}>
                                        <Text type="secondary">x{detail.quantity}</Text>
                                        <Divider type="vertical" />
                                        <Text>
                                            {formatPrice(detail.unit_price, {
                                                includeSymbol: true,
                                            })}
                                            /1
                                        </Text>
                                        <Divider type="vertical" />

                                        <Text strong>
                                            {formatPrice(productTotal, {
                                                includeSymbol: true,
                                            })}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </div>

                            {/* ===== TOPPINGS ===== */}
                            {toppings.length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                    <Title level={5} style={{ marginBottom: 4 }}>
                                        Toppings
                                    </Title>
                                    {toppings.map((top: ToppingOrderDetail, idx: number) => {
                                        const toppingImage =
                                            top.topping?.images?.[0]?.image_name ||
                                            "/no-image.png";
                                        const totalToppingQty = top.quantity * detail.quantity;
                                        const totalToppingPrice = top.unit_price * totalToppingQty;
                                        return (
                                            <Flex
                                                key={top.id}
                                                justify="space-between"
                                                align="center"
                                                style={{
                                                    padding: "4px 8px",
                                                    borderBottom:
                                                        idx < toppings.length - 1
                                                            ? "1px solid #f0f0f0"
                                                            : "none",
                                                }}
                                            >
                                                <Flex gap={8} align="center">
                                                    <AppImageSize
                                                        alt={top.topping?.name}
                                                        src={toppingImage}
                                                        width={35}
                                                        height={35}
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                    <Text>
                                                        {idx + 1}. {top.topping?.name}
                                                    </Text>
                                                </Flex>
                                                <Flex gap={12}>
                                                    <Text type="secondary">
                                                        x{top.quantity} per unit × {detail.quantity} = x{totalToppingQty}
                                                    </Text>
                                                    <Divider type="vertical" />
                                                    <Text>
                                                        {formatPrice(top.unit_price, {
                                                            includeSymbol: true,
                                                        })}
                                                        /1
                                                    </Text>
                                                    <Divider type="vertical" />
                                                    <Text strong>
                                                        {formatPrice(totalToppingPrice, {
                                                            includeSymbol: true,
                                                        })}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ===== OPTIONS ===== */}
                            {options.length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                    <Title level={5} style={{ marginBottom: 4 }}>
                                        Options
                                    </Title>
                                    {options.map((opt, idx) => (
                                        <Flex
                                            key={opt.id}
                                            justify="space-between"
                                            align="center"
                                            style={{ padding: "4px 8px" }}
                                        >
                                            <Text>
                                                {opt.option_group?.name || "Option"}: {opt.name}
                                            </Text>
                                        </Flex>
                                    ))}
                                </div>
                            )}
                        </Panel>
                    );
                })}
            </Collapse>

            <Divider />
            <Flex justify="space-between">
                <div>
                    {order.status === OrderStatus.COMPLETED && (
                        <Button
                            icon={<DownloadOutlined />}
                            type="primary"
                            onClick={handleGetInvoice}
                        >
                            Get Invoice
                        </Button>
                    )}
                </div>
                <div>
                    {canCancel && activeConfirmButton && (
                        <Button
                            icon={<CloseCircleOutlined />}
                            danger
                            onClick={handleCancel}
                        >
                            Cancel Order
                        </Button>
                    )}
                </div>
            </Flex>
        </div>
    );
}
