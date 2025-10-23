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
    Size
} from "@/interfaces";
import { AppImage, AppImageSize } from "@/components/commons";
import { formatPrice } from "@/utils";
import { CarouselRef } from "antd/es/carousel";
import { v4 as uuidv4 } from "uuid";

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
            return productPosItem.product.sizes?.[0]?.size ? [productPosItem.product.sizes[0].size] : [];
        }
        return (productPosItem.product.sizes || []).map(ps => ps.size);
    }, [productPosItem.product]);

    // ===== INITIALIZE STATE - AUTO SELECT FIRST SIZE FOR ADD MODE =====
    useEffect(() => {
        if (!open) return;

        setQuantity(productPosItem.quantity);
        setSelectedOptions(productPosItem.optionsSelected || []);
        setToppingQuantities(productPosItem.toppings || []);

        // ✅ AUTO SELECT FIRST SIZE KHI ADD VÀ IS_MULTI_SIZE
        if (mode === "add" && productPosItem.product.is_multi_size && availableSizes.length > 0) {
            setSelectedSize(availableSizes[0]);
        } else {
            setSelectedSize(productPosItem.size);
        }
    }, [open, productPosItem, mode, availableSizes]);

    // ===== HELPER FUNCTIONS =====


    const getBasePrice = useMemo(() => {
        if (productPosItem.product.is_multi_size && selectedSize) {
            const productSize = productPosItem.product.sizes?.find(ps => ps.size.id === selectedSize.id);
            return productSize?.price || productPosItem.product.price || 0;
        }
        return productPosItem.product.sizes?.[0]?.price || productPosItem.product.price || 0;
    }, [productPosItem.product, selectedSize]);

    const getToppingsTotalPrice = useMemo(() => {
        return toppingQuantities.reduce((total, { topping, toppingQuantity }) => {
            return total + (topping.price || 0) * toppingQuantity;
        }, 0);
    }, [toppingQuantities]);

    const totalPrice = useMemo(() => {
        return getBasePrice + getToppingsTotalPrice;
    }, [getBasePrice, getToppingsTotalPrice]);

    // ===== HANDLERS =====
    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
    };

    const handleToppingQuantityChange = (topping: Topping, delta: number) => {
        setToppingQuantities(prev => {
            const existingIndex = prev.findIndex(item => item.topping.id === topping.id);

            if (existingIndex !== -1) {
                const newQuantity = Math.max(0, prev[existingIndex].toppingQuantity + delta);
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

    const handleOptionSelect = (optionGroup: OptionGroup, optionValue: OptionValue) => {
        setSelectedOptions(prev =>
            prev
                .filter(item => item.optionGroup.id !== optionGroup.id)
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

    // ===== RENDER =====
    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={800}
                title={mode === "add" ? <div style={{ color: token.colorPrimary }}>  <ShoppingCartOutlined className="mr-1" />Add item</div> : <div style={{ color: token.colorPrimary }}> <EditOutlined className="mr-1" />Edit item</div>}
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
                            <AppImage
                                src={productPosItem.product.images?.[0]?.image_name}
                                alt={productPosItem.product.name}
                                style={{
                                    height: 220,
                                    width: 220,
                                    borderRadius: token.borderRadiusSM,

                                }}
                                isContain={false}
                            />
                        </div>

                    </Col>

                    {/* RIGHT COLUMN - Product Info & Options */}
                    <Col xs={{ span: 24, order: 1 }} lg={{ span: 12, order: 2 }}>
                        <Typography.Title level={4}>{productPosItem.product.name}</Typography.Title>

                        <Flex justify="space-between" align="center">
                            <Typography.Title
                                level={4}
                                style={{ color: token.colorPrimary, marginTop: token.marginXS }}
                            >
                                {formatPrice(totalPrice, { includeSymbol: true })} {" "}
                                <span style={{ fontSize: "0.7em", fontWeight: 400 }}>
                                    / 1
                                </span>
                            </Typography.Title>
                            <Flex align="center" gap={8}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    type="primary"
                                    icon={<MinusOutlined />}
                                    onClick={() => handleQuantityChange(-1)}
                                />
                                <span style={{ width: 20, textAlign: "center" }}>{quantity}</span>
                                <Button
                                    size="small"
                                    shape="circle"
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleQuantityChange(1)}
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
                                        const size = availableSizes.find(s => s.id === sizeId);
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
                                        const productSize = productPosItem.product.sizes?.find(ps => ps.size.id === size.id);
                                        const isActive = selectedSize?.id === size.id;
                                        return (
                                            <Radio.Button
                                                key={size.id}
                                                value={size.id}
                                                style={{
                                                    cursor: "pointer",
                                                    border: `1px solid ${isActive ? token.colorPrimary : token.colorBorderSecondary}`,
                                                    borderRadius: token.borderRadius,
                                                    padding: "4px",
                                                    minWidth: 72,
                                                    minHeight: 64,
                                                    textAlign: "center",
                                                    background: isActive ? token.colorPrimaryBg : token.colorFillAlter,
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
                                                        fontSize: token.fontSizeSM,
                                                    }}
                                                >
                                                    {size.name}
                                                </div>
                                                {/* ✅ HORIZONTAL LINE */}
                                                <div style={{
                                                    fontSize: token.fontSizeSM,
                                                    color: isActive ? token.colorPrimaryTextActive : token.colorTextTertiary,
                                                    fontWeight: isActive ? 600 : 400,
                                                }}>
                                                    {formatPrice(productSize?.price || 0, { includeSymbol: true })}
                                                </div>
                                            </Radio.Button>
                                        );
                                    })}
                                </Radio.Group>
                            </div>
                        )}

                        {/* OPTIONS SECTION */}
                        {productPosItem.product.optionGroups.map((optionGroup: ProductOptionValueGroup) => {
                            const selectedOption = selectedOptions.find(opt => opt.optionGroup.id === optionGroup.id);

                            return (
                                <div key={optionGroup.id} style={{ marginTop: token.marginLG }}>
                                    <Typography.Text strong>{optionGroup.name}</Typography.Text>
                                    {/* <Radio.Group
                                        buttonStyle="solid"
                                        onChange={(e) => {
                                            const optionValueId = parseInt(e.target.value);
                                            const optionValue = optionGroup.values.find(val => val.id === optionValueId);
                                            if (optionValue) {
                                                handleOptionSelect(optionGroup, optionValue);
                                            }
                                        }}
                                        value={selectedOption?.optionValue.id}
                                        style={{ display: "flex", flexWrap: "wrap", marginTop: token.marginSM }}
                                    >
                                        {optionGroup.values.map((optionValue: OptionValue) => (
                                            <Radio.Button
                                                key={optionValue.id}
                                                value={optionValue.id}
                                                style={{
                                                    borderRadius: token.borderRadiusSM,
                                                    marginRight: token.marginXS
                                                }}
                                            >
                                                {optionValue.name}
                                            </Radio.Button>
                                        ))}
                                    </Radio.Group> */}
                                    <Radio.Group
                                        buttonStyle="solid"
                                        value={selectedOption?.optionValue.id}
                                        style={{ display: "flex", flexWrap: "wrap", marginTop: token.marginSM }}
                                    >
                                        {optionGroup.values.map((optionValue: OptionValue) => {
                                            const isSelected = selectedOption?.optionValue.id === optionValue.id;
                                            return (
                                                <Radio.Button
                                                    key={optionValue.id}
                                                    value={optionValue.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            //  Nếu click lại cùng option → uncheck
                                                            setSelectedOptions(prev =>
                                                                prev.filter(item => item.optionGroup.id !== optionGroup.id)
                                                            );
                                                        } else {
                                                            //  Nếu chọn option khác → chọn mới
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
                        })}
                    </Col>

                    {/* TOPPINGS SECTION */}
                    {(productPosItem.product.toppings || []).length > 0 && (
                        // đặt toàn bộ section vào 1 Col để Row parent vẫn giữ thứ tự theo order
                        <Col xs={{ span: 24, order: 3 }} lg={{ span: 24, order: 3 }} style={{ marginTop: token.marginSM }}>
                            <Typography.Text strong>Select Toppings</Typography.Text>

                            <Row gutter={[12, 8]} style={{ marginTop: token.marginSM }}>
                                {(productPosItem.product.toppings || []).map((topping: Topping) => {
                                    const currentItem = toppingQuantities.find(t => t.topping.id === topping.id);
                                    const currentQty = currentItem?.toppingQuantity || 0;

                                    return (
                                        // mỗi topping là 1 Col: mobile full, sm+ 2 cột
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
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{topping.name}</div>
                                                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                                        {formatPrice(topping.price, { includeSymbol: true })}
                                                    </Typography.Text>
                                                </div>
                                                <Flex align="center" gap={8}>
                                                    <Button
                                                        size="small"
                                                        shape="circle"
                                                        type="primary"
                                                        icon={<MinusOutlined />}
                                                        onClick={() => handleToppingQuantityChange(topping, -1)}
                                                    />
                                                    <span style={{ width: 20, textAlign: "center" }}>{currentQty}</span>
                                                    <Button
                                                        size="small"
                                                        shape="circle"
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => handleToppingQuantityChange(topping, 1)}
                                                    />
                                                </Flex>
                                            </Flex>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Col>
                    )}

                    {/* FOOTER */}
                    <Col span={24} order={4}>
                        <Button
                            type="primary"
                            size="large"
                            icon={mode === "add" ? <ShoppingCartOutlined /> : <CheckOutlined />}
                            block
                            style={{
                                background: token.colorPrimary,
                                borderColor: token.colorPrimary,
                                height: 48,
                                fontWeight: 500
                            }}
                            onClick={handleSave}
                        >
                            {mode === "add" ? "Add to order items" : "Update order item"}: {formatPrice(totalPrice * quantity, { includeSymbol: true })}
                        </Button>
                    </Col>
                </Row>
            </Modal >
        </>
    );
};