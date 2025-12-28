"use client";

import React from "react";
import {
    Drawer, Divider, Typography, Input, message, Flex, Avatar, Button,
    Card, Tag, Empty, Tooltip
} from "antd";
import {
    IdcardOutlined, UserOutlined, CloseOutlined, ReloadOutlined
} from "@ant-design/icons";
import { UserSearchSelector } from "@/components/features/pos";
import { User, Voucher } from "@/interfaces";
import { voucherService } from "@/services/voucherService";

const { Title, Text } = Typography;

interface OrderBenefitsDrawerProps {
    open: boolean;
    onClose: () => void;
    selectedCustomer: User | null;
    onSelectCustomer: (value: User | null) => void;
    selectedVoucher: Voucher | null;
    onSelectVoucher: (voucher: Voucher | null) => void;
    subtotal: number;
}

interface VoucherWithStatus extends Voucher {
    disabled?: boolean;
    reason?: string;
}

export const OrderBenefitsDrawer: React.FC<OrderBenefitsDrawerProps> = ({
    open,
    onClose,
    selectedCustomer,
    onSelectCustomer,
    selectedVoucher,
    onSelectVoucher,
    subtotal,
}) => {
    const [discountInput, setDiscountInput] = React.useState<string>("");

    const originalVouchersRef = React.useRef<VoucherWithStatus[] | null>(null);

    // ✅ Cập nhật danh sách gốc khi đổi customer
    React.useEffect(() => {
        if (selectedCustomer) {
            originalVouchersRef.current = selectedCustomer.Voucher
                ? [...selectedCustomer.Voucher]
                : [];
        } else {
            originalVouchersRef.current = null;
        }
    }, [selectedCustomer?.id]);

    // ✅ Reset danh sách voucher
    const handleResetVouchers = () => {
        if (!selectedCustomer) return;
        const reset = originalVouchersRef.current || [];
        const updated = { ...selectedCustomer, Voucher: [...reset] };

        const stillValid = selectedVoucher && reset.some(v => v.id === selectedVoucher.id);
        onSelectCustomer(updated);
        onSelectVoucher(stillValid ? selectedVoucher : null);
    };

    // ✅ Tự động disable voucher không đủ min order
    React.useEffect(() => {
        if (!selectedCustomer?.Voucher) return;
        const updatedVouchers = selectedCustomer.Voucher.map(v => {
            const disabled = subtotal < v.minAmountOrder;
            const reason = disabled ? `Yêu cầu đơn tối thiểu ${v.minAmountOrder.toLocaleString()}đ` : "";
            return { ...v, disabled, reason };
        });

        onSelectCustomer({ ...selectedCustomer, Voucher: updatedVouchers });

        if (selectedVoucher && subtotal < selectedVoucher.minAmountOrder) {
            onSelectVoucher(null);
        }
    }, [subtotal]);

    const handleApplyVoucher = async () => {
        const code = discountInput.trim();
        if (!code) return;
        try {
            const voucher = await voucherService.getByCode(code);
            if (!voucher) {
                message.error("Invalid voucher code");
                setDiscountInput("");
                return;
            }
            if (subtotal < voucher.minAmountOrder) {
                message.warning(`Require order min ${voucher.minAmountOrder.toLocaleString()}đ`);
                onSelectVoucher(null);
                return;
            }

            // ✅ Thêm voucher vào danh sách nếu chưa có
            const updatedVouchers = selectedCustomer?.Voucher ? [...selectedCustomer.Voucher] : [];
            if (!updatedVouchers.some(v => v.id === voucher.id)) {
                updatedVouchers.push(voucher);
            }

            if (selectedCustomer) {
                onSelectCustomer({ ...selectedCustomer, Voucher: updatedVouchers });
            }

            onSelectVoucher(voucher);
            message.success(`Applied ${voucher.code} (${voucher.discount_percentage}% off)`);
        } catch {
            message.error("Invalid voucher code");
        } finally {
            setDiscountInput("");
        }
    };


    const handleDeleteCustomer = () => {
        onSelectCustomer(null);
        onSelectVoucher(null);
        originalVouchersRef.current = null;
    };

    const handleSelectVoucherClick = (voucher: VoucherWithStatus) => {
        if (voucher.disabled) return;
        if (selectedVoucher?.id === voucher.id) onSelectVoucher(null);
        else onSelectVoucher(voucher);
    };

    return (
        <Drawer
            title={
                <Text style={{ fontSize: 24, fontWeight: 700 }}>
                    Thông tin đơn hàng
                </Text>
            }
            open={open}
            onClose={onClose}
            width={600}
            bodyStyle={{ padding: 24, fontSize: 18 }}
        >
            {/* Customer */}
            <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ fontSize: 22, marginBottom: 16 }}>
                    <UserOutlined style={{ fontSize: 22, marginRight: 8 }} /> Khách hàng
                </Title>

                <UserSearchSelector
                    style={{ width: "100%", height: 56, fontSize: 18 }}
                    onSelect={onSelectCustomer}
                />

                {selectedCustomer && (
                    <Flex align="center" justify="space-between" style={{
                        marginTop: 16, 
                        padding: 16, 
                        borderRadius: 12, 
                        backgroundColor: "#fafafa", 
                        border: "2px solid #eee",
                    }}>
                        <Flex align="center" gap={16}>
                            <Avatar src={selectedCustomer.detail?.avatar_url} icon={<UserOutlined />} size={56} />
                            <div>
                                <Text strong style={{ fontSize: 18, display: "block", marginBottom: 4 }}>
                                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 16, display: "block", marginBottom: 4 }}>
                                    {selectedCustomer.phone_number}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 16 }}>
                                    Email: {selectedCustomer.email || "N/A"}
                                </Text>
                            </div>
                        </Flex>
                        <Button 
                            type="text" 
                            icon={<CloseOutlined style={{ fontSize: 20 }} />} 
                            onClick={handleDeleteCustomer} 
                            danger
                            size="large"
                        />
                    </Flex>
                )}
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Voucher Section */}
            <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Title level={3} style={{ fontSize: 22 }}>
                        <IdcardOutlined style={{ fontSize: 22, marginRight: 8 }} /> Voucher
                    </Title>
                    <Button 
                        type="dashed" 
                        size="large" 
                        icon={<ReloadOutlined style={{ fontSize: 18 }} />} 
                        onClick={handleResetVouchers}
                        style={{ fontSize: 16 }}
                    />
                </Flex>

                <Input.Search
                    style={{ width: "100%", height: 56, fontSize: 18 }}
                    placeholder="Nhập mã voucher"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    enterButton={<span style={{ fontSize: 18 }}>Áp dụng</span>}
                    onSearch={handleApplyVoucher}
                    size="large"
                />

                {selectedVoucher && (
                    <div style={{
                        marginTop: 16, 
                        padding: 16, 
                        borderRadius: 12,
                        backgroundColor: "#f6ffed", 
                        border: "2px solid #b7eb8f"
                    }}>
                        <Text type="success" style={{ fontSize: 18 }}>
                            Voucher đã áp dụng: <strong>{selectedVoucher.code}</strong> (Giảm {selectedVoucher.discount_percentage}%)
                        </Text>
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <>
                    <Divider plain style={{ margin: "24px 0" }}>
                        <Text style={{ fontSize: 20, fontWeight: 600 }}>
                            Voucher khả dụng
                        </Text>
                    </Divider>


                    {selectedCustomer.Voucher?.length ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {selectedCustomer.Voucher.map((voucher: VoucherWithStatus) => {
                                const isSelected = selectedVoucher?.id === voucher.id;
                                const card = (
                                    <Card
                                        key={voucher.id}
                                        hoverable={!voucher.disabled}
                                        onClick={() => handleSelectVoucherClick(voucher)}
                                        style={{
                                            borderColor: isSelected ? "#52c41a" : "rgba(0,0,0,0.06)",
                                            borderWidth: isSelected ? 2 : 1,
                                            backgroundColor: voucher.disabled ? "#f5f5f5"
                                                : isSelected ? "#f6ffed" : "#fff",
                                            opacity: voucher.disabled ? 0.6 : 1,
                                            cursor: voucher.disabled ? "not-allowed" : "pointer",
                                            padding: 16,
                                        }}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <div>
                                                <Text strong style={{ fontSize: 18, display: "block", marginBottom: 8 }}>
                                                    {voucher.code}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 16, display: "block", marginBottom: 4 }}>
                                                    Giảm: {voucher.discount_percentage}%
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 16 }}>
                                                    Đơn tối thiểu: {voucher.minAmountOrder.toLocaleString()}đ
                                                </Text>
                                            </div>
                                            {voucher.disabled ? (
                                                <Tag color="red" style={{ fontSize: 16, padding: "4px 12px" }}>
                                                    Không khả dụng
                                                </Tag>
                                            ) : (
                                                isSelected && <Tag color="green" style={{ fontSize: 16, padding: "4px 12px" }}>
                                                    Đã chọn
                                                </Tag>
                                            )}
                                        </Flex>
                                    </Card>
                                );

                                return voucher.disabled ? (
                                    <Tooltip key={voucher.id} title={voucher.reason || "Invalid"}>
                                        {card}
                                    </Tooltip>
                                ) : card;
                            })}
                        </div>
                    ) : (
                        <Empty
                            description="No vouchers available for this customer"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ marginTop: 16 }}
                        />
                    )}
                </>
            )}
        </Drawer>
    );
};
