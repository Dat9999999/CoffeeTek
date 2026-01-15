"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Modal,
    Button,
    Typography,
    Flex,
    Row,
    Col,
    theme,
    Radio,
    message,
    Carousel,
} from "antd";
import {
    CheckOutlined,
    EditOutlined,
    LeftOutlined,
    MinusOutlined,
    PlusOutlined,
    RightOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import {
    ProductPosItem,
    Product,
    Topping,
    ProductOptionValueGroup,
    OptionGroup,
    OptionValue,
    Size,
} from "@/interfaces";
// ✅ 1. Import PosProductSize từ service (nơi nó được định nghĩa)
import { PosProductSize } from "@/services";
import { AppImage, AppImageSize } from "@/components/commons";
import { formatPrice } from "@/utils";
import { CarouselRef } from "antd/es/carousel";
import { v4 as uuidv4 } from "uuid";

// ✅ 2. Thêm các hàm helper để tính toán và định dạng %
/**
 * @description Tính % giảm giá từ giá cũ và giá mới
 */
const calculateDiscountPercent = (
    oldPrice: number | null | undefined,
    newPrice: number | null | undefined
): number => {
    const oldP = oldPrice ?? 0;
    const newP = newPrice ?? 0;
    if (oldP <= 0 || oldP <= newP) {
        return 0;
    }
    return ((oldP - newP) / oldP) * 100;
};

/**
 * @description Định dạng % giảm giá
 * (Làm tròn lên nếu >= 1%, giữ 2 số tp nếu < 1%)
 */
const formatDiscountPercent = (discount: number): string => {
    if (discount <= 0) return "0";
    if (discount >= 1) {
        return Math.ceil(discount).toString();
    }
    return parseFloat(discount.toFixed(2)).toString();
};

export const ProductPosItemModal = ({
    productPosItem,
    open = false,
    onClose,
    onSave,
    mode,
}: {
    productPosItem: ProductPosItem;
    open?: boolean;
    onClose?: () => void;
    onSave?: (item: ProductPosItem) => void;
    mode: "add" | "update";
}) => {
    const { token } = theme.useToken();
    const carouselRef = useRef<CarouselRef>(null);
    // ===== STATE MANAGEMENT =====
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);

    const [selectedOptions, setSelectedOptions] = useState<{
        optionGroup: OptionGroup;
        optionValue: OptionValue;
    }[]>([]);

    const [toppingQuantities, setToppingQuantities] = useState<{
        topping: Topping;
        toppingQuantity: number;
    }[]>([]);

    const availableSizes = useMemo((): Size[] => {
        if (!productPosItem.product.is_multi_size) {
            return productPosItem.product.sizes?.[0]?.size
                ? [productPosItem.product.sizes[0].size]
                : [];
        }
        return (productPosItem.product.sizes || []).map((ps) => ps.size);
    }, [productPosItem.product]);

    // ===== INITIALIZE STATE - AUTO SELECT FIRST SIZE FOR ADD MODE =====
    useEffect(() => {
        if (!open) return;

        setQuantity(productPosItem.quantity);
        setSelectedOptions(productPosItem.optionsSelected || []);
        setToppingQuantities(productPosItem.toppings || []);

        if (
            mode === "add" &&
            productPosItem.product.is_multi_size &&
            availableSizes.length > 0
        ) {
            setSelectedSize(availableSizes[0]);
        } else {
            setSelectedSize(productPosItem.size);
        }
    }, [open, productPosItem, mode, availableSizes]);

    // ===== HELPER FUNCTIONS =====

    const getBasePrice = useMemo(() => {
        if (productPosItem.product.is_multi_size && selectedSize) {
            const productSize = productPosItem.product.sizes?.find(
                (ps) => ps.size.id === selectedSize.id
            );
            return productSize?.price || productPosItem.product.price || 0;
        }
        return (
            productPosItem.product.sizes?.[0]?.price ||
            productPosItem.product.price ||
            0
        );
    }, [productPosItem.product, selectedSize]);

    // ✅ 3. Lấy giá CŨ của sản phẩm (chỉ dùng cho loại 1 size)
    const getSingleSizeOldPrice = useMemo(() => {
        const { product } = productPosItem;
        if (product.is_multi_size) return null; // Logic KM nhiều size nằm ở chỗ khác

        // Lấy old_price từ product.sizes[0] (nếu có) hoặc từ product.old_price
        return product.sizes?.[0]?.old_price || product.old_price || null;
    }, [productPosItem.product]);

    const getToppingsTotalPrice = useMemo(() => {
        return toppingQuantities.reduce((total, { topping, toppingQuantity }) => {
            return total + (topping.price || 0) * toppingQuantity;
        }, 0);
    }, [toppingQuantities]);

    const totalPrice = useMemo(() => {
        return getBasePrice + getToppingsTotalPrice;
    }, [getBasePrice, getToppingsTotalPrice]);

    // ===== HANDLERS =====
    // ... (handleQuantityChange, handleToppingQuantityChange, handleOptionSelect, handleSave không đổi) ...
    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
    };

    const handleToppingQuantityChange = (topping: Topping, delta: number) => {
        setToppingQuantities((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.topping.id === topping.id
            );

            if (existingIndex !== -1) {
                const newQuantity = Math.max(
                    0,
                    prev[existingIndex].toppingQuantity + delta
                );
                if (newQuantity === 0) {
                    return prev.filter((_, index) => index !== existingIndex);
                }
                const updated = [...prev];
                updated[existingIndex] = { topping, toppingQuantity: newQuantity };
                return updated;
            } else if (delta > 0) {
                return [...prev, { topping, toppingQuantity: 1 }];
            }
            return prev;
        });
    };

    const handleOptionSelect = (
        optionGroup: OptionGroup,
        optionValue: OptionValue
    ) => {
        setSelectedOptions((prev) =>
            prev
                .filter((item) => item.optionGroup.id !== optionGroup.id)
                .concat({ optionGroup, optionValue })
        );
    };

    const handleSave = () => {
        const updatedItem: ProductPosItem = {
            posItemId: uuidv4(),
            product: productPosItem.product,
            quantity,
            size: selectedSize,
            optionsSelected: selectedOptions,
            toppings: toppingQuantities,
        };

        onSave?.(updatedItem);
        // message.success(`${mode === 'add' ? 'Added' : 'Updated'} item successfully!`);
        onClose?.();
    };

    // ✅ 4. Component render giảm giá (để tái sử dụng)
    const renderDiscount = (
        oldPrice: number | null | undefined,
        newPrice: number | null | undefined
    ) => {
        const discount = calculateDiscountPercent(oldPrice, newPrice);
        if (discount <= 0 || !oldPrice) return null;

        return (
            <Flex align="center" gap={4} wrap="wrap" style={{ lineHeight: 1.1 }}>
                <Typography.Text delete type="secondary" style={{ fontSize: "0.9em" }}>
                    {formatPrice(oldPrice, { includeSymbol: true })}
                </Typography.Text>
                <span
                    style={{
                        fontSize: "0.8em",
                        fontWeight: 700,
                        color: token.colorError,
                        whiteSpace: "nowrap", // Không xuống dòng
                    }}
                >
                    (-{formatDiscountPercent(discount)}%)
                </span>
            </Flex>
        );
    };

    // ===== RENDER =====
    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={1000}
                title={
                    mode === "add" ? (
                        <div style={{ color: token.colorPrimary, fontSize: 24, fontWeight: 700 }}>
                            {" "}
                            <ShoppingCartOutlined className="mr-1" style={{ fontSize: 24 }} />
                            Thêm sản phẩm
                        </div>
                    ) : (
                        <div style={{ color: token.colorPrimary, fontSize: 24, fontWeight: 700 }}>
                            {" "}
                            <EditOutlined className="mr-1" style={{ fontSize: 24 }} />
                            Chỉnh sửa sản phẩm
                        </div>
                    )
                }
                centered
                closable={false}
                styles={{
                    content: {
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        padding: token.paddingLG,
                    },
                }}
            >
                <Row gutter={[36, 12]}>
                    {/* LEFT COLUMN - Image & Toppings */}
                    <Col xs={{ span: 24, order: 2 }} lg={{ span: 12, order: 1 }}>
                        {/* ... (Image) ... */}
                        <div
                            style={{
                                background: token.colorFillAlter,
                                borderRadius: token.borderRadiusLG,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: token.padding,
                            }}
                        >
                            <AppImageSize
                                height={300}
                                width={300}
                                src={productPosItem.product.images?.[0]?.image_name}
                                alt={productPosItem.product.name}
                                style={{
                                    objectFit: "cover",
                                    borderRadius: token.borderRadiusSM,
                                }}
                            />
                        </div>
                    </Col>

                    {/* RIGHT COLUMN - Product Info & Options */}
                    <Col xs={{ span: 24, order: 1 }} lg={{ span: 12, order: 2 }}>
                        <Typography.Title level={3} style={{ fontSize: 28, marginBottom: token.marginMD }}>
                            {productPosItem.product.name}
                        </Typography.Title>

                        <Flex justify="space-between" align="center">
                            {/* ✅ 5. Cập nhật khu vực giá chính */}
                            <Flex align="center" gap={token.marginXS}>
                                <Typography.Title
                                    level={3}
                                    style={{
                                        color: token.colorPrimary,
                                        marginTop: 0,
                                        marginBottom: 0,
                                        fontSize: 32,
                                    }}
                                >
                                    {formatPrice(totalPrice, { includeSymbol: true })}{" "}
                                    <span style={{ fontSize: "0.6em", fontWeight: 400 }}>
                                        / 1
                                    </span>
                                </Typography.Title>

                                {/* ✅ CHỈ HIỂN THỊ GIẢM GIÁ NẾU LÀ SẢN PHẨM 1 SIZE */}
                                {!productPosItem.product.is_multi_size &&
                                    renderDiscount(getSingleSizeOldPrice, getBasePrice)}
                            </Flex>

                            <Flex align="center" gap={8}>
                                {/* ... (Quantity buttons) ... */}
                                <Button
                                    size="large"
                                    shape="circle"
                                    type="primary"
                                    icon={<MinusOutlined style={{ fontSize: 20 }} />}
                                    onClick={() => handleQuantityChange(-1)}
                                    style={{ width: 48, height: 48 }}
                                />
                                <span style={{ minWidth: 40, textAlign: "center", fontSize: 24, fontWeight: 700 }}>
                                    {quantity}
                                </span>
                                <Button
                                    size="large"
                                    shape="circle"
                                    type="primary"
                                    icon={<PlusOutlined style={{ fontSize: 20 }} />}
                                    onClick={() => handleQuantityChange(1)}
                                    style={{ width: 48, height: 48 }}
                                />
                            </Flex>
                        </Flex>

                        {/* SIZE SECTION - WITH HORIZONTAL LINE & AUTO SELECT */}
                        {availableSizes.length > 0 && (
                            <div style={{ marginTop: token.marginLG }}>
                                <Typography.Text strong>Select Size</Typography.Text>
                                <Radio.Group
                                    onChange={(e) => {
                                        const sizeId = parseInt(e.target.value);
                                        const size = availableSizes.find((s) => s.id === sizeId);
                                        setSelectedSize(size);
                                    }}
                                    value={selectedSize?.id}
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: token.marginXS,
                                        marginTop: token.marginXS,
                                        padding: 0,
                                    }}
                                >
                                    {availableSizes.map((size) => {
                                        // ✅ 6. Lấy productSize (kiểu PosProductSize)
                                        const productSize =
                                            productPosItem.product.sizes?.find(
                                                (ps) => ps.size.id === size.id
                                            ) as PosProductSize | undefined; // Ép kiểu để lấy old_price

                                        const isActive = selectedSize?.id === size.id;

                                        // ✅ 7. Lấy giá mới và cũ cho size NÀY
                                        const newPrice = productSize?.price || 0;
                                        const oldPrice = productSize?.old_price;

                                        return (
                                            <Radio.Button
                                                key={size.id}
                                                value={size.id}
                                                style={{
                                                    cursor: "pointer",
                                                    border: `1px solid ${isActive
                                                        ? token.colorPrimary
                                                        : token.colorBorderSecondary
                                                        }`,
                                                    borderRadius: token.borderRadius,
                                                    padding: "4px 8px", // Tăng padding ngang
                                                    minWidth: 72,
                                                    height: "auto", // Để vừa 2 hàng nếu có KM
                                                    minHeight: 64,
                                                    textAlign: "center",
                                                    background: isActive
                                                        ? token.colorPrimaryBg
                                                        : token.colorFillAlter,
                                                    transition: "all 0.2s ease",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: 0,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: isActive ? token.colorPrimary : token.colorText,
                                                    }}
                                                >
                                                    {size.name}
                                                </div>

                                                {/* ✅ 8. HIỂN THỊ GIÁ/GIẢM GIÁ CHO NHIỀU SIZE */}
                                                <div
                                                    style={{

                                                        color: isActive
                                                            ? token.colorPrimaryTextActive
                                                            : token.colorTextTertiary,
                                                        fontWeight: isActive ? 600 : 400,
                                                    }}
                                                >
                                                    <Flex
                                                        vertical // ✅ THAY ĐỔI: Chuyển sang layout dọc
                                                        align="center"
                                                        justify="center"
                                                        // gap={4} // Bỏ gap ngang
                                                        // wrap="wrap" // Bỏ wrap
                                                        style={{ lineHeight: 1.2 }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight: isActive ? 700 : 600,
                                                                color: isActive
                                                                    ? token.colorPrimary
                                                                    : token.colorText,
                                                            }}
                                                        >
                                                            {formatPrice(newPrice, { includeSymbol: true })}
                                                        </span>

                                                        {/* ✅ Chỉ render nếu là multi-size */}
                                                        {/* Thẻ span này sẽ tự động xuống hàng do flex direction="column" */}
                                                        <span >
                                                            {productPosItem.product.is_multi_size &&
                                                                renderDiscount(oldPrice, newPrice)}
                                                        </span>
                                                    </Flex>
                                                </div>
                                            </Radio.Button>
                                        );
                                    })}
                                </Radio.Group>
                            </div>
                        )}

                        {/* OPTIONS SECTION */}
                        {/* ... (Toàn bộ logic Option không đổi) ... */}
                        {productPosItem.product.optionGroups.map(
                            (optionGroup: ProductOptionValueGroup) => {
                                const selectedOption = selectedOptions.find(
                                    (opt) => opt.optionGroup.id === optionGroup.id
                                );

                                return (
                                    <div key={optionGroup.id} style={{ marginTop: token.marginLG }}>
                                        <Typography.Text strong>{optionGroup.name}</Typography.Text>
                                        <Radio.Group
                                            buttonStyle="solid"
                                            value={selectedOption?.optionValue.id}
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                marginTop: token.marginSM,
                                            }}
                                        >
                                            {optionGroup.values.map((optionValue: OptionValue) => {
                                                const isSelected =
                                                    selectedOption?.optionValue.id === optionValue.id;
                                                return (
                                                    <Radio.Button
                                                        key={optionValue.id}
                                                        value={optionValue.id}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedOptions((prev) =>
                                                                    prev.filter(
                                                                        (item) =>
                                                                            item.optionGroup.id !== optionGroup.id
                                                                    )
                                                                );
                                                            } else {
                                                                handleOptionSelect(optionGroup, optionValue);
                                                            }
                                                        }}
                                                        style={{
                                                            borderRadius: token.borderRadiusSM,
                                                            marginRight: token.marginXS,
                                                        }}
                                                    >
                                                        {optionValue.name}
                                                    </Radio.Button>
                                                );
                                            })}
                                        </Radio.Group>
                                    </div>
                                );
                            }
                        )}
                    </Col>

                    {/* TOPPINGS SECTION */}
                    {/* ... (Toàn bộ logic Topping không đổi) ... */}
                    {(productPosItem.product.toppings || []).length > 0 && (
                        <Col
                            xs={{ span: 24, order: 3 }}
                            lg={{ span: 24, order: 3 }}
                            style={{ marginTop: token.marginSM }}
                        >
                            <Typography.Text strong>Select Toppings</Typography.Text>

                            <Row gutter={[12, 8]} style={{ marginTop: token.marginSM }}>
                                {(productPosItem.product.toppings || []).map(
                                    (topping: Topping) => {
                                        const currentItem = toppingQuantities.find(
                                            (t) => t.topping.id === topping.id
                                        );
                                        const currentQty = currentItem?.toppingQuantity || 0;

                                        return (
                                            <Col xs={24} sm={12} key={topping.id}>
                                                <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    style={{
                                                        border: `1px solid ${token.colorBorderSecondary}`,
                                                        borderRadius: token.borderRadius,
                                                        padding: token.paddingXS,
                                                        background: token.colorFillAlter,
                                                    }}
                                                    gap={token.marginXS}
                                                >
                                                    <Flex align="center" gap={token.marginXS}>
                                                        <AppImageSize
                                                            height={50}
                                                            width={50}
                                                            src={topping.image_name}
                                                            alt={topping.name}
                                                            style={{
                                                                objectFit: "cover",
                                                                borderRadius: token.borderRadiusSM,
                                                                border: `1px solid ${token.colorBorderSecondary}`,
                                                            }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>
                                                                {topping.name}
                                                            </div>
                                                            <Typography.Text
                                                                type="secondary"
                                                                style={{ fontSize: token.fontSizeSM }}
                                                            >
                                                                {formatPrice(topping.price, {
                                                                    includeSymbol: true,
                                                                })}
                                                            </Typography.Text>
                                                        </div>
                                                    </Flex>
                                                    <Flex align="center" gap={8}>
                                                        <Button
                                                            size="small"
                                                            shape="circle"
                                                            type="primary"
                                                            icon={<MinusOutlined />}
                                                            onClick={() =>
                                                                handleToppingQuantityChange(topping, -1)
                                                            }
                                                        />
                                                        <span style={{ width: 20, textAlign: "center" }}>
                                                            {currentQty}
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            shape="circle"
                                                            type="primary"
                                                            icon={<PlusOutlined />}
                                                            onClick={() =>
                                                                handleToppingQuantityChange(topping, 1)
                                                            }
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Col>
                                        );
                                    }
                                )}
                            </Row>
                        </Col>
                    )}

                    {/* FOOTER */}
                    <Col span={24} order={4}>
                        {/* ... (Footer button không đổi) ... */}
                        <Button
                            type="primary"
                            size="large"
                            icon={
                                mode === "add" ? <ShoppingCartOutlined style={{ fontSize: 24 }} /> : <CheckOutlined style={{ fontSize: 24 }} />
                            }
                            block
                            style={{
                                background: token.colorPrimary,
                                borderColor: token.colorPrimary,
                                height: 64,
                                fontSize: 22,
                                fontWeight: 700,
                            }}
                            onClick={handleSave}
                        >
                            {mode === "add" ? "Add to Order" : "Update"}:{" "}
                            {formatPrice(totalPrice * quantity, { includeSymbol: true })}
                        </Button>
                    </Col>
                </Row>
            </Modal>
        </>
    );
};