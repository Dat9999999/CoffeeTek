// src/components/features/orders/OrderDetailModal.tsx
"use client";

import React from "react";
import { Modal, Descriptions, Collapse, Typography, Flex, Divider } from "antd";
import type { Order, OrderDetail, ToppingOrderDetail } from "@/interfaces";
import { formatPrice } from "@/utils";
import dayjs from "dayjs";
import { AppImageSize } from "@/components/commons";
import { DownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface OrderDetailModalProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
}

export function OrderDetailModal({ open, onClose, order }: OrderDetailModalProps) {
    if (!order) return null;

    return (
        <Modal
            open={open}
            title={`Order #${order.id} Details`}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {/* ===== ORDER INFO ===== */}
            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Created At">
                    {dayjs(order.created_at).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Text strong>{order.status.toUpperCase()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Customer Phone">
                    {order.customerPhone || "Guest"}
                </Descriptions.Item>
                <Descriptions.Item label="Note">{order.note || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Original Price">
                    {formatPrice(order.original_price, { includeSymbol: true })}
                </Descriptions.Item>
                <Descriptions.Item label="Final Price">
                    {formatPrice(order.final_price, { includeSymbol: true })}
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
                    <Flex vertical={true} justify="center" align="center" style={{ height: "100%" }}>
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
                        (sum, top) => sum + top.unit_price * top.quantity,
                        0
                    );
                    const subtotal = productTotal + toppingTotal;

                    const descriptionParts: string[] = [];

                    // ⚡ Thêm dòng này lên trước (topping trước)
                    if (toppings.length > 0) {
                        descriptionParts.push(`${toppings.length} topping${toppings.length > 1 ? "s" : ""}`);
                    }

                    if (options.length > 0) {
                        descriptionParts.push(
                            options
                                .map(
                                    (opt) =>
                                        `${opt.option_group?.name || "Option"}: ${opt.name}`
                                )
                                .join(", ")
                        );
                    }


                    return (
                        <Panel
                            key={detail.id}
                            header={
                                <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                                    {/* === LEFT: Image + Name === */}
                                    <Flex gap={8} align="center">
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

                                    {/* === CENTER: Description === */}
                                    <Text type="secondary" style={{ flex: 1, textAlign: "center" }}>
                                        {descriptionParts.length > 0 ? descriptionParts.join(" | ") : ""}
                                    </Text>

                                    {/* === RIGHT: Size + Quantity + Subtotal === */}
                                    <Flex gap={12} align="center">
                                        <Text type="secondary">Size: {sizeText}</Text>
                                        <Text>x{detail.quantity}</Text>
                                        <Text strong>{formatPrice(subtotal, { includeSymbol: true })}</Text>
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
                                        borderBottom: toppings.length > 0 ? "1px solid #f0f0f0" : "none",
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
                                        <Text>{formatPrice(detail.unit_price, { includeSymbol: true })}/1</Text>
                                        <Divider type="vertical" />
                                        <Text strong>{formatPrice(productTotal, { includeSymbol: true })}</Text>
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
                                                    <Text type="secondary">x{top.quantity}</Text>
                                                    <Divider type="vertical" />
                                                    <Text>
                                                        {formatPrice(top.unit_price, { includeSymbol: true })}/1
                                                    </Text>
                                                    <Divider type="vertical" />
                                                    <Text strong>
                                                        {formatPrice(top.quantity * top.unit_price, { includeSymbol: true })}
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
                                                {idx + 1}. {opt.option_group?.name}: {opt.name}
                                            </Text>
                                        </Flex>
                                    ))}
                                </div>
                            )}

                            {/* ===== SUBTOTAL ===== */}
                            <Divider style={{ margin: "8px 0" }} />
                            <Flex justify="flex-end" style={{ paddingRight: 8 }}>
                                <Text strong>
                                    Subtotal:&nbsp;{formatPrice(subtotal, { includeSymbol: true })}
                                </Text>
                            </Flex>
                        </Panel>
                    );
                })}
            </Collapse>
        </Modal>
    );
}
