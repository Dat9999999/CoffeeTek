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
            title="Order Benefits"
            open={open}
            onClose={onClose}
            width={380}
            bodyStyle={{ padding: 20 }}
        >
            {/* Customer */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4}><UserOutlined /> Customer</Title>

                <UserSearchSelector
                    style={{ width: "100%" }}
                    onSelect={onSelectCustomer}
                />

                {selectedCustomer && (
                    <Flex align="center" justify="space-between" style={{
                        marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: "#fafafa", border: "1px solid #eee",
                    }}>
                        <Flex align="center" gap={12}>
                            <Avatar src={selectedCustomer.detail?.avatar_url} icon={<UserOutlined />} size={40} />
                            <div>
                                <Text strong>
                                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                                </Text><br />
                                <Text type="secondary">{selectedCustomer.phone_number}</Text><br />
                                <Text type="secondary">Email: {selectedCustomer.email || "N/A"}</Text>
                            </div>
                        </Flex>
                        <Button type="text" icon={<CloseOutlined />} onClick={handleDeleteCustomer} danger />
                    </Flex>
                )}
            </div>

            <Divider />

            {/* Voucher Section */}
            <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                    <Title level={4}><IdcardOutlined /> Voucher</Title>
                    <Button type="dashed" size="small" icon={<ReloadOutlined />} onClick={handleResetVouchers} />
                </Flex>

                <Input.Search
                    style={{ width: "100%", height: 40 }}
                    placeholder="Input voucher code"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    enterButton="Apply"
                    onSearch={handleApplyVoucher}
                />

                {selectedVoucher && (
                    <div style={{
                        marginTop: 12, padding: 8, borderRadius: 6,
                        backgroundColor: "#f6ffed", border: "1px solid #b7eb8f"
                    }}>
                        <Text type="success">
                            Voucher applied: <strong>{selectedVoucher.code}</strong> ({selectedVoucher.discount_percentage}% off)
                        </Text>
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <>
                    <Divider plain  >
                        <span className="text-center mb-4 font-semibold" >Available Vouchers</span>
                    </Divider>


                    {selectedCustomer.Voucher?.length ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {selectedCustomer.Voucher.map((voucher: VoucherWithStatus) => {
                                const isSelected = selectedVoucher?.id === voucher.id;
                                const card = (
                                    <Card
                                        key={voucher.id}
                                        size="small"
                                        hoverable={!voucher.disabled}
                                        onClick={() => handleSelectVoucherClick(voucher)}
                                        style={{
                                            borderColor: isSelected ? "#52c41a" : "rgba(0,0,0,0.06)",
                                            backgroundColor: voucher.disabled ? "#f5f5f5"
                                                : isSelected ? "#f6ffed" : "#fff",
                                            opacity: voucher.disabled ? 0.6 : 1,
                                            cursor: voucher.disabled ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <div>
                                                <Text strong>{voucher.code}</Text><br />
                                                <Text type="secondary">
                                                    Discount: {voucher.discount_percentage}%
                                                </Text><br />
                                                <Text type="secondary">
                                                    Min Order: {voucher.minAmountOrder.toLocaleString()}đ
                                                </Text>
                                            </div>
                                            {voucher.disabled ? (
                                                <Tag color="red">Unavailable</Tag>
                                            ) : (
                                                isSelected && <Tag color="green">Selected</Tag>
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
