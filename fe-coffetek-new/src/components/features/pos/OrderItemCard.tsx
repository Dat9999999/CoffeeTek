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
        <>
            <Divider plain style={{ margin: 4 }}>
            </Divider>
            <Flex align="center" gap={12} style={{}}>
                {/* Ảnh sản phẩm */}
                <Flex align="center" justify="center" style={{ height: 75, width: 75 }}>
                    <AppImage
                        alt={item.product.name}
                        src={item.product.images?.[0]?.image_name || ""}
                        style={{ width: 75, height: 75 }}
                    />
                </Flex>

                {/* Nội dung */}
                <Flex justify="space-between" vertical={true} style={{ padding: "5px 0px", minHeight: 75 }} flex={1} >
                    <Flex justify="space-between" align="center">
                        <span style={{ color: token.colorPrimary, fontWeight: 500 }}>{item.product.name}</span>
                        <Flex gap={8}>
                            <EditOutlined
                                style={{ cursor: "pointer", color: token.colorPrimary }}
                                onClick={onEdit}
                            />
                            <DeleteOutlined

                                style={{ cursor: "pointer", color: token.colorError }}
                                onClick={onDelete}
                            />
                        </Flex>
                    </Flex>
                    <div><Typography.Text type="secondary" style={{ marginTop: 4 }}>{getDescription()}</Typography.Text></div>
                    <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
                        <div style={{ color: token.colorPrimary, fontWeight: 600 }}>
                            {formatPrice(unitPrice, { includeSymbol: true })}{" "}
                            <span style={{ fontSize: "0.9em", fontWeight: 400 }}>
                                / 1
                            </span>
                        </div>
                        {/* Nút tăng giảm */}
                        <Flex align="center" justify="space-between" gap={4} >
                            <Button
                                size="small"
                                shape="circle"
                                onClick={handleDecrease}
                                type="primary"
                                icon={<MinusOutlined />}
                            >
                            </Button>
                            <span
                                style={{ width: 20, textAlign: "center", color: token.colorPrimary, fontWeight: 400 }}
                            >
                                {item.quantity}
                            </span>
                            <Button
                                size="small"
                                shape="circle"
                                onClick={handleIncrease}
                                type="primary"
                                icon={<PlusOutlined />}
                            >
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>

        </>
    );
};