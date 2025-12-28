import React from "react";
import { Button, Divider, Flex, theme, Typography } from "antd";
import { DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { AppImage } from "@/components/commons";
import { formatPrice } from "@/utils";
import { ProductPosItem } from "@/interfaces"; // Import the actual type

interface OrderItemCardProps {
    item: ProductPosItem;
    onEdit?: () => void;
    onDelete?: () => void;
    onQuantityChange?: (newQuantity: number) => void;
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({
    item,
    onEdit,
    onDelete,
    onQuantityChange,
}) => {
    const { token } = theme.useToken();

    const calculateBasePrice = (): number => {
        const product = item.product;
        if (product.is_multi_size && item.size) {
            const productSize = product.sizes?.find(ps => ps.size.id === item.size?.id);
            return productSize?.price || product.price || 0;
        }
        return product.sizes?.[0]?.price || product.price || 0;
    };

    const calculateToppingsPrice = (): number => {
        return (item.toppings || []).reduce((total, { topping, toppingQuantity }) => {
            return total + (topping.price || 0) * toppingQuantity;
        }, 0);
    };

    const unitPrice = calculateBasePrice() + calculateToppingsPrice();

    const getDescription = (): string => {
        const parts: string[] = [];
        if (item.size) {
            parts.push(`Size: ${item.size.name}`);
        }
        if (item.optionsSelected && item.optionsSelected.length > 0) {
            parts.push(
                item.optionsSelected.map(opt => `${opt.optionGroup.name}: ${opt.optionValue.name}`).join(", ")
            );
        }
        if (item.toppings && item.toppings.length > 0) {
            parts.push(
                item.toppings.map(t => `${t.topping.name} x${t.toppingQuantity}`).join(", ")
            );
        }
        return parts.join(" | ");
    };

    const handleDecrease = () => {
        if (onQuantityChange && item.quantity > 1) {
            onQuantityChange(item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (onQuantityChange) {
            onQuantityChange(item.quantity + 1);
        }
    };

    return (
        <div
            style={{
                padding: token.paddingSM,
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowTertiary,
            }}
        >
            <Flex align="flex-start" gap={12}>
                {/* Ảnh sản phẩm */}
                <Flex 
                    align="center" 
                    justify="center" 
                    style={{ 
                        height: 70, 
                        width: 70,
                        borderRadius: token.borderRadiusSM,
                        overflow: "hidden",
                        flexShrink: 0,
                        border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <AppImage
                        alt={item.product.name}
                        src={item.product.images?.[0]?.image_name || ""}
                        style={{ width: 70, height: 70, objectFit: "cover" }}
                    />
                </Flex>

                {/* Nội dung */}
                <Flex 
                    justify="space-between" 
                    vertical={true} 
                    style={{ 
                        padding: token.paddingXXS,
                        minHeight: 70,
                        flex: 1,
                    }} 
                >
                    <Flex justify="space-between" align="flex-start" style={{ marginBottom: token.marginXXS }}>
                        <div style={{ flex: 1 }}>
                            <Typography.Text 
                                style={{ 
                                    color: token.colorPrimary, 
                                    fontWeight: 600,
                                    fontSize: 15,
                                    display: "block",
                                    marginBottom: token.marginXXS,
                                }}
                            >
                                {item.product.name}
                            </Typography.Text>
                            {getDescription() && (
                                <Typography.Text 
                                    type="secondary" 
                                    style={{ 
                                        fontSize: 12,
                                        display: "block",
                                    }}
                                >
                                    {getDescription()}
                                </Typography.Text>
                            )}
                        </div>
                        <Flex gap={8} style={{ marginLeft: token.marginXS }}>
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined style={{ fontSize: 14 }} />}
                                onClick={onEdit}
                                style={{
                                    color: token.colorPrimary,
                                    width: 32,
                                    height: 32,
                                    padding: 0,
                                }}
                            />
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                                onClick={onDelete}
                                style={{
                                    color: token.colorError,
                                    width: 32,
                                    height: 32,
                                    padding: 0,
                                }}
                            />
                        </Flex>
                    </Flex>
                    <Flex justify="space-between" align="center" style={{ marginTop: "auto" }}>
                        <div>
                            <Typography.Text 
                                style={{ 
                                    color: token.colorPrimary, 
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                {formatPrice(unitPrice, { includeSymbol: true })}
                            </Typography.Text>
                            <Typography.Text 
                                style={{ 
                                    fontSize: 12,
                                    color: token.colorTextSecondary,
                                    marginLeft: token.marginXXS,
                                }}
                            >
                                / 1
                            </Typography.Text>
                        </div>
                        {/* Nút tăng giảm */}
                        <Flex align="center" gap={8} style={{
                            backgroundColor: token.colorFillQuaternary,
                            padding: token.paddingXXS,
                            borderRadius: token.borderRadiusSM,
                        }}>
                            <Button
                                size="small"
                                shape="circle"
                                onClick={handleDecrease}
                                type="primary"
                                icon={<MinusOutlined style={{ fontSize: 12 }} />}
                                disabled={item.quantity <= 1}
                                style={{
                                    width: 32,
                                    height: 32,
                                    minWidth: 32,
                                }}
                            />
                            <span
                                style={{ 
                                    minWidth: 32,
                                    textAlign: "center", 
                                    color: token.colorPrimary, 
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                {item.quantity}
                            </span>
                            <Button
                                size="small"
                                shape="circle"
                                onClick={handleIncrease}
                                type="primary"
                                icon={<PlusOutlined style={{ fontSize: 12 }} />}
                                style={{
                                    width: 32,
                                    height: 32,
                                    minWidth: 32,
                                }}
                            />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </div>
    );
};