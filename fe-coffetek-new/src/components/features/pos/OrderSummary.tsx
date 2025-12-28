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
            className="w-full mx-auto"
            style={{ 
                boxSizing: "border-box", 
                padding: token.paddingMD,
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadow,
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                ...style 
            }}
        >
            <Flex vertical gap={12} style={{ width: "100%" }}>
                {/* Header - Fixed */}
                <Typography.Title
                    style={{ 
                        color: token.colorPrimary,
                        fontSize: 24,
                        fontWeight: 700,
                        margin: 0,
                        marginBottom: token.marginXXS,
                        flexShrink: 0,
                    }}
                    level={3}
                >
                    <ShoppingOutlined style={{ marginRight: 8, fontSize: 24 }} /> 
                    Đơn hàng ({posItems?.length || 0})
                </Typography.Title>

                {/* Items List */}
                {!posItems?.length ? (
                    <Card style={{ 
                        borderRadius: token.borderRadiusLG,
                        backgroundColor: token.colorFillQuaternary,
                        border: `2px dashed ${token.colorBorderSecondary}`,
                    }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Text style={{ fontSize: 18, color: token.colorTextSecondary }}>
                                    Chưa có sản phẩm
                                </Text>
                            }
                        />
                    </Card>
                ) : (
                    <div style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        paddingRight: token.paddingXS,
                    }}>
                        <Flex vertical gap={8}>
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
                    </div>
                )}

                {/* Bottom Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* ========== PHẦN THANH TOÁN (LÊN TRÊN) ========== */}
                    <Divider plain style={{ margin: `${token.marginXS} 0` }}>
                        <Text
                            style={{ 
                                color: token.colorPrimary,
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            Thanh toán
                        </Text>
                    </Divider>

                    <div className="flex justify-between py-2" style={{
                        paddingLeft: token.paddingSM,
                        paddingRight: token.paddingSM,
                    }}>
                        <Text style={{ fontSize: 18, color: token.colorTextSecondary }}>Tạm tính</Text>
                        <Text style={{ fontSize: 18, fontWeight: 600 }}>
                            {formatPrice(totalAmount, { includeSymbol: true })}
                        </Text>
                    </div>

                    <div className="flex justify-between py-2" style={{
                        paddingLeft: token.paddingSM,
                        paddingRight: token.paddingSM,
                    }}>
                        <Text style={{ fontSize: 18, color: token.colorTextSecondary }}>Giảm giá</Text>
                        <Space>
                            {selectedVoucher ? (
                                <>
                                    <Text style={{ fontSize: 18, color: token.colorSuccess, fontWeight: 600 }}>
                                        -{selectedVoucher?.discount_percentage || 0}%
                                    </Text>
                                    <Divider size="large" type="vertical" />
                                    <Text style={{ fontSize: 18, color: token.colorSuccess, fontWeight: 600 }}>
                                        -{formatPrice(discountValue, {
                                            includeSymbol: true,
                                        })}
                                    </Text>
                                </>
                            ) : (
                                <Text style={{ fontSize: 18, color: token.colorTextTertiary }}>
                                    <RightOutlined />
                                </Text>
                            )}
                        </Space>
                    </div>

                    <div 
                        className="flex justify-between py-4 px-4 rounded-lg"
                        style={{
                            backgroundColor: token.colorPrimaryBg,
                            border: `2px solid ${token.colorPrimary}`,
                            marginTop: token.marginXS,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 700, color: token.colorPrimary }}>
                            Tổng thanh toán
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: token.colorPrimary }}>
                            {formatPrice(totalPayment, { includeSymbol: true })}
                        </Text>
                    </div>

                    <Divider plain style={{ margin: `${token.marginXS} 0` }}>
                        <Text
                            style={{ 
                                color: token.colorPrimary,
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            Phương thức
                        </Text>
                    </Divider>

                    <Radio.Group
                        className="flex flex-col gap-2"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        size="large"
                    >
                        <Radio 
                            value="cash"
                            style={{
                                fontSize: 18,
                                padding: token.paddingSM,
                                borderRadius: token.borderRadius,
                                border: `2px solid ${paymentMethod === "cash" ? token.colorPrimary : token.colorBorderSecondary}`,
                                backgroundColor: paymentMethod === "cash" ? token.colorPrimaryBg : "transparent",
                            }}
                        >
                            <DollarOutlined style={{ fontSize: 20, marginRight: 8 }} /> 
                            Tiền mặt
                        </Radio>
                        <Radio 
                            value="vnpay"
                            style={{
                                fontSize: 18,
                                padding: token.paddingSM,
                                borderRadius: token.borderRadius,
                                border: `2px solid ${paymentMethod === "vnpay" ? token.colorPrimary : token.colorBorderSecondary}`,
                                backgroundColor: paymentMethod === "vnpay" ? token.colorPrimaryBg : "transparent",
                            }}
                        >
                            <MobileOutlined style={{ fontSize: 20, marginRight: 8 }} /> 
                            VNPAY
                        </Radio>
                    </Radio.Group>

                    {/* ✅ Cash details */}
                    {paymentMethod === "cash" && (
                        <Flex vertical gap={10} style={{
                            padding: token.paddingMD,
                            backgroundColor: token.colorFillQuaternary,
                            borderRadius: token.borderRadiusLG,
                        }}>
                            <div className="flex justify-between items-center">
                                <Text style={{ fontSize: 18, fontWeight: 600 }}>Tiền nhận</Text>

                                <InputNumber<number>
                                    addonAfter={getPriceSymbol()}
                                    variant="filled"
                                    min={0}
                                    value={cashReceived}
                                    style={{ 
                                        width: 200,
                                        fontSize: 18,
                                        height: 52,
                                    }}
                                    placeholder="Nhập số tiền"
                                    size="large"
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

                            <div className="flex justify-between items-center py-2">
                                <Text style={{ fontSize: 20, fontWeight: 700 }}>Tiền thừa</Text>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: 700, 
                                    color: change > 0 ? token.colorSuccess : token.colorText,
                                }}>
                                    {formatPrice(change, { includeSymbol: true })}
                                </Text>
                            </div>
                        </Flex>
                    )}

                    {/* Button Thanh toán */}
                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ArrowRightOutlined style={{ fontSize: 22 }} />}
                        iconPosition="end"
                        disabled={
                            (paymentMethod === "cash" &&
                                (!cashReceived || cashReceived < totalPayment)) || posItems.length === 0
                        }
                        onClick={onPay}
                        style={{
                            height: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: token.borderRadiusLG,
                            boxShadow: posItems.length > 0 && 
                                !(paymentMethod === "cash" && (!cashReceived || cashReceived < totalPayment))
                                ? `0 4px 12px ${token.colorPrimary}40` : "none",
                            marginTop: token.marginXS,
                        }}
                    >
                        {posItems.length === 0 ? "Chưa có sản phẩm" : "Thanh toán"}
                    </Button>

                    {/* ========== PHẦN THÔNG TIN ĐƠN HÀNG (XUỐNG DƯỚI) ========== */}
                    <Divider plain style={{ margin: `${token.marginMD} 0 ${token.marginXS} 0` }}>
                        <Text
                            style={{ 
                                color: token.colorPrimary,
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            Thông tin đơn hàng
                        </Text>
                    </Divider>

                    {/* Customer */}
                    <div
                        className="flex justify-between items-center py-3 px-4 cursor-pointer rounded-lg transition-all hover:bg-gray-50"
                        onClick={() => setOpen(true)}
                        style={{
                            backgroundColor: token.colorFillQuaternary,
                            border: `2px solid ${token.colorBorderSecondary}`,
                        }}
                    >
                        <Flex align="center" gap={10}>
                            <UserOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>Khách hàng</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                            <Text style={{ fontSize: 18, fontWeight: 600, color: selectedCustomer ? token.colorText : token.colorTextSecondary }}>
                                {selectedCustomer?.last_name || "Chọn"}
                            </Text>
                            <RightOutlined
                                style={{
                                    fontSize: 16,
                                    color: token.colorTextSecondary,
                                }}
                            />
                        </Flex>
                    </div>

                    {/* Voucher */}
                    <div
                        className="flex justify-between items-center py-3 px-4 cursor-pointer rounded-lg transition-all hover:bg-gray-50"
                        onClick={() => setOpen(true)}
                        style={{
                            backgroundColor: token.colorFillQuaternary,
                            border: `2px solid ${token.colorBorderSecondary}`,
                        }}
                    >
                        <Flex align="center" gap={10}>
                            <IdcardOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>Voucher</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                            <Text style={{ fontSize: 18, fontWeight: 600, color: selectedVoucher ? token.colorSuccess : token.colorTextSecondary }}>
                                {selectedVoucher
                                    ? selectedVoucher.code
                                    : "Chọn"}
                            </Text>
                            <RightOutlined
                                style={{
                                    fontSize: 16,
                                    color: token.colorTextSecondary,
                                }}
                            />
                        </Flex>
                    </div>

                    {/* Note */}
                    <div
                        className="flex justify-between items-center py-3 px-4 cursor-pointer rounded-lg transition-all hover:bg-gray-50"
                        onClick={() => setNoteModalOpen(true)}
                        style={{
                            backgroundColor: token.colorFillQuaternary,
                            border: `2px solid ${token.colorBorderSecondary}`,
                        }}
                    >
                        <Flex align="center" gap={10}>
                            <FileTextOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>Ghi chú</Text>
                        </Flex>
                        <Flex align="center" gap={8} style={{ flex: '0 1 auto', overflow: 'hidden' }}>
                            <div style={{ maxWidth: '180px', overflow: 'hidden' }}>
                                <Text
                                    ellipsis={{
                                        tooltip: true,
                                    }}
                                    style={{
                                        fontSize: 18,
                                        minWidth: 0,
                                        color: note ? token.colorText : token.colorTextSecondary,
                                        fontWeight: 500,
                                    }}
                                >
                                    {note || "Thêm"}
                                </Text>
                            </div>
                            <RightOutlined
                                style={{
                                    fontSize: 16,
                                    color: token.colorTextSecondary,
                                }}
                            />
                        </Flex>
                    </div>
                </div>
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
                title={
                    <Text style={{ fontSize: 24, fontWeight: 700 }}>
                        Thêm ghi chú đơn hàng
                    </Text>
                }
                open={noteModalOpen}
                onOk={handleSaveNote}
                onCancel={() => setNoteModalOpen(false)}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
                okButtonProps={{ size: "large", style: { fontSize: 18, height: 48 } }}
                cancelButtonProps={{ size: "large", style: { fontSize: 18, height: 48 } }}
            >
                <TextArea
                    rows={8}
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    placeholder="Nhập ghi chú cho đơn hàng..."
                    style={{ fontSize: 18 }}
                    size="large"
                />
            </Modal>
        </div>
    );
};
