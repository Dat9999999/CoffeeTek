"use client";
import { ProductSearchSelector, CategoryMenuSelector } from "@/components/features/pos";
import React, { useState } from "react";

export default function PosPageTest() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    return (
        <div style={{ maxWidth: "50%" }}>
            <CategoryMenuSelector
                showUncategorized={true}
                onSelect={(id) => setSelectedCategoryId(id)}
            />

            <div style={{ marginTop: 100 }}>
                <b>Category ID đang chọn:</b> {selectedCategoryId ?? "null"}
            </div>

            <div
                style={{
                    marginTop: "100px",
                }}
            >

            </div>
            <ProductSearchSelector
                style={{
                    width: "100%",
                }}

            />
        </div>
    );
}
