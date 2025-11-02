import React from "react";
import { Product } from "@/interfaces";
import { AppImage, AppImageSize } from "@/components/commons";
import { Flex, Tag, theme, Typography } from "antd";
import { formatCompactPriceProduct, formatPriceProduct } from "@/utils";

const { Text } = Typography;

interface ProductOptionItemProps {
    label: string;
    product: Product;
}

export const ProductOptionItem: React.FC<ProductOptionItemProps> = ({
    label,
    product,
}) => {
    const imageUrl = product?.images?.[0]?.image_name ?? null;
    const { token } = theme.useToken();
    return (
        <Flex
            align="center"
            justify="space-between"
            style={{
                padding: 6,
                borderRadius: 6,
                transition: "background-color 0.2s",
                cursor: "pointer",
            }}
        >
            {/* Bên trái: ảnh + thông tin */}
            <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
                {imageUrl && (
                    <AppImage
                        src={imageUrl}
                        alt={label}
                        style={{
                            width: 50,
                            height: 50,
                            // objectFit: "cover",
                            borderRadius: 6,
                            flexShrink: 0,
                        }}
                        preview={false}
                    />
                )}

                {/* Tên + size */}
                <Flex vertical style={{ overflow: "hidden" }}>
                    <Text
                        strong
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {product.name}
                    </Text>

                    {/* Hiển thị size (nếu có) */}
                    {product.sizes && product.sizes.length > 0 && (
                        <Flex gap={4} wrap>
                            {product.sizes.map((ps) => (
                                <Tag
                                    key={ps.size.id}
                                    color="green"
                                    style={{
                                        fontSize: 10,
                                        marginInlineEnd: 0,
                                    }}
                                >
                                    {ps.size?.name ?? "Size"}
                                </Tag>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </Flex>

            {/* Bên phải: Giá */}
            <Text strong style={{ fontSize: 12, flexShrink: 0, color: token.colorPrimaryActive }}>
                {formatPriceProduct(product)}
            </Text>
        </Flex>
    );
};
