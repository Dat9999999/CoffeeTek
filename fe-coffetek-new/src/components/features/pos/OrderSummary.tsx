"use client";

import React from "react";
import { Card, Divider, Radio, Checkbox, Button, Typography, theme, Flex, Empty } from "antd";
import { ArrowRightOutlined, CreditCardOutlined, DeleteOutlined, DollarOutlined, EditOutlined, MobileOutlined, ShoppingOutlined } from "@ant-design/icons";
import { formatPrice } from "@/utils"
import { AppImage } from "@/components/commons";
import { OrderItemCard } from "./OrderItemCard";
import { ProductPosItem } from "@/interfaces";

interface OrderSummaryProps {
    posItems: ProductPosItem[] | null;
    onEdit?: (item: ProductPosItem) => void;
    onDelete?: (item: ProductPosItem) => void;
    onQuantityChange?: (item: ProductPosItem, quantity: number) => void;
    style?: React.CSSProperties;
}
const OrderSummary: React.FC<OrderSummaryProps> = ({
    posItems,
    onEdit,
    onDelete,
    onQuantityChange,
    style,
}: OrderSummaryProps) => {
    const { token } = theme.useToken();


    const calculateUnitPrice = (item: ProductPosItem): number => {
        const basePrice = item.product.is_multi_size && item.size
            ? item.product.sizes?.find(ps => ps.size.id === item.size?.id)?.price || item.product.price || 0
            : item.product.sizes?.[0]?.price || item.product.price || 0;

        const toppingsPrice = (item.toppings || []).reduce((total, { topping, toppingQuantity }) => {
            return total + (topping.price || 0) * toppingQuantity;
        }, 0);

        return basePrice + toppingsPrice;
    };

    const totalAmount = posItems
        ? posItems.reduce((sum, item) => sum + calculateUnitPrice(item) * item.quantity, 0)
        : 0;

    // Giả sử discount = 0, bạn có thể thêm logic để tính discount sau
    const discount = 0;
    const subtotal = totalAmount;
    const totalPayment = subtotal - discount;


    return (
        <div className="w-full mx-auto " style={{ boxSizing: "border-box", ...style }}  >
            <Flex vertical>
                <Typography.Title style={{ color: token.colorPrimary }} level={5}><ShoppingOutlined /> Order Summary ({posItems?.length})</Typography.Title>

                {!posItems || posItems.length === 0 ? (
                    <div style={{ ...style, background: token.colorBgContainer, padding: token.padding, borderRadius: token.borderRadius }}>

                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items" />;
                    </div>
                ) : (
                    <Flex vertical gap={12}>
                        {posItems?.map((item) => (
                            <OrderItemCard
                                key={item.product.id}
                                item={item}
                                onEdit={() => onEdit?.(item)}
                                onDelete={() => onDelete?.(item)}
                                onQuantityChange={(newQuantity) => onQuantityChange?.(item, newQuantity)}
                            />
                        ))}
                    </Flex>
                )}



                <Divider className="my-1" />
                <p style={{ color: token.colorPrimary }} className="font-semibold mb-1">Payment Summary</p>
                <div className="flex justify-between py-1">
                    <Typography.Text type="secondary" >Subtotal</Typography.Text>
                    <Typography.Text type="secondary">{formatPrice(subtotal, { includeSymbol: true })}</Typography.Text>
                </div>

                <div className="flex justify-between py-1">
                    <Typography.Text type="secondary" >Discount</Typography.Text>
                    <Typography.Text type="secondary" className=" cursor-pointer">{formatPrice(discount, { includeSymbol: true })} ›</Typography.Text>
                </div>

                <div className="flex justify-between text-base font-semibold">
                    <span className="font-medium" style={{ color: token.colorPrimary }}>Total payment</span>
                    <Typography.Text strong style={{ color: token.colorPrimary }} className="font-medium">{formatPrice(totalPayment, { includeSymbol: true })}</Typography.Text>
                </div>

                <Divider className="my-1" />

                {/* Phương thức thanh toán */}
                <div>
                    <p className="font-semibold mb-2">Payment method</p>
                    <Radio.Group style={{ color: token.colorPrimary }} className="flex flex-col gap-2">
                        <Radio checked={true} style={{ color: token.colorPrimary }} value="cash">
                            <DollarOutlined className="mr-1" /> Cash
                        </Radio>
                        <Radio style={{ color: token.colorPrimary }} value="momo">
                            <MobileOutlined className="mr-1" /> VNPAY
                        </Radio>
                    </Radio.Group>
                </div>


                <Button
                    type="primary"
                    size="middle"
                    block
                    className="my-4  "
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                >
                    Pay Now
                </Button>
            </Flex>
        </ div >
    );
};

export { OrderSummary };