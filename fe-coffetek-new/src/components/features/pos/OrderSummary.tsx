"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    Divider,
    Radio,
    Button,
    Typography,
    theme,
    Flex,
    Empty,
    Space,
    message,
    InputNumber,
    Modal,
    Input,
} from "antd";
import {
    ArrowRightOutlined,
    DollarOutlined,
    MobileOutlined,
    ShoppingOutlined,
    UserOutlined,
    IdcardOutlined,
    RightOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import {
    formatPrice,
    getPriceSymbol,
    parsePrice,
    restrictInputToNumbers,
} from "@/utils";
import { OrderItemCard } from "./OrderItemCard";
import { ProductPosItem, User, Voucher } from "@/interfaces";
import { OrderBenefitsDrawer } from "./OrderBenefitsDrawer";

const { Text } = Typography;
const { TextArea } = Input;

interface OrderSummaryProps {
    posItems: ProductPosItem[];
    onEdit: (item: ProductPosItem) => void;
    onDelete: (item: ProductPosItem) => void;
    onQuantityChange: (item: ProductPosItem, quantity: number) => void;
    style?: React.CSSProperties;

    selectedCustomer: User | null;
    setSelectedCustomer: (user: User | null) => void;
    selectedVoucher: Voucher | null;
    setSelectedVoucher: (voucher: Voucher | null) => void;

    paymentMethod: "cash" | "vnpay";
    setPaymentMethod: (method: "cash" | "vnpay") => void;

    payment: {
        cashReceived: number;
        change: number;
    };
    setPayment: React.Dispatch<
        React.SetStateAction<{
            cashReceived: number;
            change: number;
        }>
    >;


    note: string;
    setNote: (note: string) => void;

    onPay?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    posItems,
    onEdit,
    onDelete,
    onQuantityChange,
    style,

    selectedCustomer,
    setSelectedCustomer,
    selectedVoucher,
    setSelectedVoucher,

    paymentMethod,
    setPaymentMethod,

    payment,
    setPayment,
    note,
    setNote,
    onPay,
}) => {
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [tempNote, setTempNote] = useState("");

    // 💰 destruct payment fields
    const { cashReceived, change } = payment;

    // ✅ round up to nearest thousand
    const roundUpToNearestThousand = (value: number) =>
        Math.ceil(value / 1000) * 1000;

    // ✅ Calculate unit price
    const calculateUnitPrice = (item: ProductPosItem): number => {
        const basePrice =
            item.product.is_multi_size && item.size
                ? item.product.sizes?.find(
                    (ps) => ps.size.id === item.size?.id
                )?.price || item.product.price || 0
                : item.product.sizes?.[0]?.price || item.product.price || 0;

        const toppingsPrice = (item.toppings || []).reduce(
            (t, { topping, toppingQuantity }) =>
                t + (topping.price || 0) * toppingQuantity,
            0
        );

        return basePrice + toppingsPrice;
    };

    // ✅ Subtotal (before discount)
    const totalAmount = posItems
        ? posItems.reduce(
            (sum, item) => sum + calculateUnitPrice(item) * item.quantity,
            0
        )
        : 0;

    // ✅ Validate voucher
    useEffect(() => {
        if (!selectedVoucher) return;
        if (totalAmount < selectedVoucher.minAmountOrder) {
            message.warning(
                `Minimum order ${formatPrice(selectedVoucher.minAmountOrder, {
                    includeSymbol: true,
                })} required for voucher ${selectedVoucher.code}`
            );
            setSelectedVoucher(null);
        }
    }, [totalAmount]);

    // ✅ Discount
    const discountValue = selectedVoucher
        ? (totalAmount * selectedVoucher.discount_percentage) / 100
        : 0;

    // ✅ Final total
    const totalPayment = totalAmount - discountValue;

    // ✅ Auto-set cashReceived when payment method is cash
    useEffect(() => {
        if (paymentMethod === "cash") {
            const rounded = roundUpToNearestThousand(totalPayment);
            setPayment((prev) => ({ ...prev, cashReceived: rounded }));
        }
    }, [totalPayment, paymentMethod]);

    // ✅ Update change when cashReceived changes
    useEffect(() => {
        if (paymentMethod === "cash") {
            let newChange =
                cashReceived && cashReceived > totalPayment
                    ? cashReceived - totalPayment
                    : 0;

            // ✅ Làm tròn xuống hàng nghìn
            newChange = Math.floor(newChange / 1000) * 1000;

            setPayment((prev) => ({ ...prev, change: newChange }));
        }
    }, [cashReceived, totalPayment, paymentMethod]);

    useEffect(() => {
        if (noteModalOpen) {
            setTempNote(note);
        }
    }, [noteModalOpen, note]);

    const handleSaveNote = () => {
        setNote(tempNote);
        setNoteModalOpen(false);
    };

    return (
        <div
            className="w-full mx-auto pl-1"
            style={{ boxSizing: "border-box", ...style }}
        >
            <Flex vertical gap={8}>
                <Typography.Title
                    style={{ color: token.colorPrimary }}
                    level={5}
                >
                    <ShoppingOutlined /> Order Summary ({posItems?.length || 0})
                </Typography.Title>

                {!posItems?.length ? (
                    <Card>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No items"
                        />
                    </Card>
                ) : (
                    <Flex vertical gap={12}>
                        {posItems.map((item) => (
                            <OrderItemCard
                                key={item.product.id}
                                item={item}
                                onEdit={() => onEdit?.(item)}
                                onDelete={() => onDelete?.(item)}
                                onQuantityChange={(q) =>
                                    onQuantityChange?.(item, q)
                                }
                            />
                        ))}
                    </Flex>
                )}

                <Divider plain style={{ margin: 4 }}>
                    <Text
                        style={{ color: token.colorPrimary }}
                        className="font-semibold py-1"
                    >
                        Order Benefits
                    </Text>
                </Divider>

                {/* Customer */}
                <div
                    className="flex justify-between items-center py-1 cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <Flex align="center" gap={6}>
                        <UserOutlined />
                        <Text type="secondary">Customer</Text>
                    </Flex>
                    <Flex align="center" gap={4}>
                        <Text>
                            {selectedCustomer?.last_name || "Add customer"}
                        </Text>
                        <RightOutlined
                            style={{
                                fontSize: 12,
                                color: token.colorTextSecondary,
                            }}
                        />
                    </Flex>
                </div>

                {/* Voucher */}
                <div
                    className="flex justify-between items-center py-1 cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <Flex align="center" gap={6}>
                        <IdcardOutlined />
                        <Text type="secondary">Voucher</Text>
                    </Flex>
                    <Flex align="center" gap={4}>
                        <Text>
                            {selectedVoucher
                                ? selectedVoucher.code
                                : "Add voucher"}
                        </Text>
                        <RightOutlined
                            style={{
                                fontSize: 12,
                                color: token.colorTextSecondary,
                            }}
                        />
                    </Flex>
                </div>

                {/* Note */}
                <div
                    className="flex justify-between items-center py-1 cursor-pointer"
                    onClick={() => setNoteModalOpen(true)}
                >
                    <Flex align="center" gap={6}>
                        <FileTextOutlined />
                        <Text type="secondary">Note</Text>
                    </Flex>
                    <Flex align="center" gap={4} style={{ flex: '0 1 auto', overflow: 'hidden' }}>
                        <div style={{ maxWidth: '250px', overflow: 'hidden' }}>
                            <Text
                                ellipsis={{
                                    tooltip: true,
                                }}
                                style={{
                                    minWidth: 0
                                }}
                            >
                                {note || "Add note"}
                            </Text>
                        </div>
                        <RightOutlined
                            style={{
                                fontSize: 12,
                                color: token.colorTextSecondary,
                            }}
                        />
                    </Flex>
                </div>

                <Divider plain style={{ margin: 4 }}>
                    <Text
                        style={{ color: token.colorPrimary }}
                        className="font-semibold py-1"
                    >
                        Payment Summary
                    </Text>
                </Divider>

                <div className="flex justify-between py-1">
                    <Text type="secondary">Subtotal</Text>
                    <Text type="secondary">
                        {formatPrice(totalAmount, { includeSymbol: true })}
                    </Text>
                </div>

                <div className="flex justify-between py-1">
                    <Text type="secondary">Discount</Text>
                    <Space>
                        {selectedVoucher ? (
                            <>
                                <Text type="secondary">
                                    -{selectedVoucher?.discount_percentage || 0}
                                    %
                                </Text>
                                <Divider size="large" type="vertical" />
                                <Text type="secondary">
                                    -
                                    {formatPrice(discountValue, {
                                        includeSymbol: true,
                                    })}
                                </Text>
                            </>
                        ) : (
                            <Text type="secondary">
                                <RightOutlined />
                            </Text>
                        )}
                    </Space>
                </div>

                <div className="flex justify-between font-semibold">
                    <span>Total payment</span>
                    <Text strong>
                        {formatPrice(totalPayment, { includeSymbol: true })}
                    </Text>
                </div>

                <Divider plain style={{ margin: 4 }}>
                    <Text
                        style={{ color: token.colorPrimary }}
                        className="font-semibold mb-2"
                    >
                        Payment Method
                    </Text>
                </Divider>

                <Radio.Group
                    className="flex flex-col gap-2 mb-2"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <Radio value="cash">
                        <DollarOutlined /> Cash
                    </Radio>
                    <Radio value="vnpay">
                        <MobileOutlined /> VNPAY
                    </Radio>
                </Radio.Group>

                {/* ✅ Cash details */}
                {paymentMethod === "cash" && (
                    <Flex vertical gap={8} className="mb-2">
                        <div className="flex justify-between items-center">
                            <Text type="secondary">Cash received</Text>

                            <InputNumber<number>
                                addonAfter={getPriceSymbol()}
                                variant="filled"
                                min={0}
                                value={cashReceived}
                                style={{ width: 140 }}
                                placeholder="Enter amount"
                                formatter={(value) =>
                                    formatPrice(value, {
                                        includeSymbol: false,
                                    })
                                }
                                parser={(value) => parsePrice(value)}
                                onChange={(val) =>
                                    setPayment((prev) => ({
                                        ...prev,
                                        cashReceived: val ?? 0,
                                    }))
                                }
                                onKeyDown={(e) => restrictInputToNumbers(e)}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <Text type="secondary">Change</Text>
                            <Text strong style={{ color: token.colorSuccess }}>
                                {formatPrice(change, { includeSymbol: true })}
                            </Text>
                        </div>
                    </Flex>
                )}

                <Button
                    type="primary"
                    size="middle"
                    block
                    className="my-4"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    disabled={
                        (paymentMethod === "cash" &&
                            (!cashReceived || cashReceived < totalPayment)) || posItems.length === 0
                    }
                    onClick={onPay}
                >
                    Pay Now
                </Button>
            </Flex>

            {/* ✅ Drawer */}
            <OrderBenefitsDrawer
                open={open}
                onClose={() => setOpen(false)}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
                selectedVoucher={selectedVoucher}
                onSelectVoucher={setSelectedVoucher}
                subtotal={totalAmount}
            />

            {/* Note Modal */}
            <Modal
                title="Add Order Note"
                open={noteModalOpen}
                onOk={handleSaveNote}
                onCancel={() => setNoteModalOpen(false)}
            >
                <TextArea
                    rows={4}
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                />
            </Modal>
        </div>
    );
};
