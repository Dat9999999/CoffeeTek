"use client";
import React, { useEffect, useState } from "react";
import { Layout, Splitter, Grid, theme, Spin } from "antd";
import {
    ProductSearchSelector,
    CategoryMenuSelector,
    ProductCardList,
    OrderSummary,
    ProductPosItemModal,
} from "@/components/features/pos";
import { OptionGroup, OptionValue, Product, ProductPosItem, Size, Topping } from "@/interfaces";
import { v4 as uuidv4 } from "uuid";

const { useBreakpoint } = Grid;
let isMobile = false;

function isSamePosItem(a: ProductPosItem, b: ProductPosItem): boolean {
    if (a.product.id !== b.product.id) return false;

    //  Nếu sản phẩm có nhiều size thì phải trùng size
    if (a.product.is_multi_size && b.product.is_multi_size) {
        if (a.size?.id !== b.size?.id) return false;
    }

    //  So toppings
    const aToppings = a.toppings ?? [];
    const bToppings = b.toppings ?? [];
    if (aToppings.length !== bToppings.length) return false;

    const sameToppings = aToppings.every(at =>
        bToppings.some(bt =>
            bt.topping.id === at.topping.id &&
            bt.toppingQuantity === at.toppingQuantity
        )
    );
    if (!sameToppings) return false;

    // ✅ So option values
    const aOptions = a.optionsSelected ?? [];
    const bOptions = b.optionsSelected ?? [];
    if (aOptions.length !== bOptions.length) return false;

    const sameOptions = aOptions.every(ao =>
        bOptions.some(bo =>
            bo.optionGroup.id === ao.optionGroup.id &&
            bo.optionValue.id === ao.optionValue.id
        )
    );
    if (!sameOptions) return false;

    return true;
}

export default function PosPageTest() {
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const [mounted, setMounted] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [posItems, setPosItems] = useState<ProductPosItem[]>([]);
    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: "add" | "update";
        item: ProductPosItem | null;
    }>({
        open: false,
        mode: "add",
        item: null,
    });
    useEffect(() => {
        setMounted(true);
    }, []);
    const handleAddPosItem = (product: Product) => {
        const newItem: ProductPosItem = {
            posItemId: uuidv4(),
            product: product,
            quantity: 1,
        };
        setModalState({
            open: true,
            mode: "add",
            item: newItem,
        });
    };
    const handleEditPosItem = (item: ProductPosItem) => {
        setModalState({
            open: true,
            mode: "update",
            item,
        });
    };

    const handleDeletePosItem = (item: ProductPosItem) => {
        setPosItems(prev => prev.filter(p => p.posItemId !== item.posItemId));
    };


    const handleQuantityChange = (item: ProductPosItem, quantity: number) => {
        if (quantity < 1 || quantity > 99) return;
        setPosItems(prev =>
            prev.map(p =>
                p.posItemId === item.posItemId ? { ...p, quantity } : p
            )
        );
    };


    const handleCloseModal = () => {
        setModalState((prev) => ({ ...prev, open: false }));
    };



    isMobile = !screens.md; // nhỏ hơn 'md' breakpoint
    if (!mounted) {
        return <Spin size="small" style={{ display: "block", margin: "40px auto" }} />;
    }
    console.log(">>> posItems: ", posItems)
    return (
        <>
            <div
                style={{
                    margin: "0 auto",
                    minHeight: "100vh",
                    overflow: "hidden",
                    padding: token.paddingXS,
                }}
            >
                {isMobile ? (
                    // ===== MOBILE: Stack layout =====
                    <div className="flex flex-col gap-4">
                        <OrderSummary
                            posItems={posItems}
                            onEdit={handleEditPosItem}
                            onDelete={handleDeletePosItem}
                            onQuantityChange={handleQuantityChange}
                        />
                        <ProductSearchSelector style={{ height: 40 }} />
                        <CategoryMenuSelector
                            showUncategorized
                            onSelect={(id) => setSelectedCategoryId(id)}
                        />
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            <ProductCardList
                                categoryId={selectedCategoryId}
                                onSelect={handleAddPosItem}
                            />
                        </div>
                    </div>
                ) : (
                    // ===== DESKTOP: Splitter layout =====
                    <Splitter
                        style={{
                            minHeight: "100vh",
                            boxSizing: "border-box",
                            // overflow: "hidden",
                        }}
                    >
                        {/* === LEFT PANEL === */}
                        <Splitter.Panel
                            defaultSize="60%"
                            min="35%"
                            style={{
                                padding: token.paddingXS,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                            }}
                        >
                            <ProductSearchSelector
                                style={{
                                    width: "100%",
                                    height: 40,
                                    marginBottom: token.marginSM,
                                }}
                            />
                            <CategoryMenuSelector
                                showUncategorized
                                onSelect={(id) => setSelectedCategoryId(id)}
                                style={{
                                    width: "100%",
                                    marginBottom: token.marginSM,
                                }}
                            />
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                }}
                            >
                                <ProductCardList
                                    pageSize={18}
                                    categoryId={selectedCategoryId}
                                    onSelect={handleAddPosItem}
                                />
                            </div>
                        </Splitter.Panel>
                        {/* === RIGHT PANEL === */}
                        <Splitter.Panel
                            defaultSize="40%"
                            min="30%"
                            style={{
                                padding: token.paddingXS,
                                overflow: "visible", // ✅ cho phép nội dung nở tự nhiên
                                height: "auto"
                            }}
                        >
                            <OrderSummary
                                posItems={posItems}
                                onEdit={handleEditPosItem}
                                onDelete={handleDeletePosItem}
                                onQuantityChange={handleQuantityChange}
                                style={{
                                    width: "100%",
                                    height: "auto", // ✅ không ép chiều cao cố định
                                    overflow: "visible", // ✅ tắt cuộn bên trong
                                }}
                            />
                        </Splitter.Panel>
                    </Splitter>
                )}
            </div>
            {modalState.item && (
                <ProductPosItemModal
                    productPosItem={modalState.item}
                    open={modalState.open}
                    mode={modalState.mode}
                    onClose={handleCloseModal}
                    onSave={(item: ProductPosItem) => {
                        setPosItems(prev => {
                            if (modalState.mode === "add") {
                                const existing = prev.find(p => isSamePosItem(p, item));
                                if (existing) {
                                    // Nếu trùng thì cộng dồn số lượng
                                    return prev.map(p =>
                                        p.posItemId === existing.posItemId
                                            ? { ...p, quantity: p.quantity + item.quantity }
                                            : p
                                    );
                                }
                                // Nếu chưa có thì thêm mới (UUID đã được sinh khi tạo newItem)
                                return [...prev, item];
                            }
                            else if (modalState.mode === "update" && modalState.item) {
                                // Cập nhật đúng item đang edit (theo posItemId)
                                return prev.map(p =>
                                    p.posItemId === modalState.item?.posItemId ? item : p
                                );
                            }
                            return prev;
                        });
                        handleCloseModal();
                    }}

                />
            )}
        </>
    );
}