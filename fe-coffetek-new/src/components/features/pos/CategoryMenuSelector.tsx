"use client";
import React, { useEffect, useState } from "react";
import { Menu, Skeleton } from "antd";
import type { MenuProps } from "antd";
import { categoryService } from "@/services";
import { Category } from "@/interfaces";

interface CategorySelectorProps {
    /** Bật tắt hiển thị mục "Others" */
    showUncategorized?: boolean;
    /** Callback khi người dùng chọn category */
    onSelect?: (categoryId: number | null) => void;
}

const CategoryMenuSelector = ({
    showUncategorized = true,
    onSelect,
}: CategorySelectorProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchCategories = async () => {
        setLoading(true);

        try {
            const res = await categoryService.getAll({
                page: 1,
                size: 9999,
                orderBy: "id",
                orderDirection: "asc",
                isParentCategory: true,
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi khi tải category:", err);
        } finally {

            setLoading(false)
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const buildMenuItems = (): MenuProps["items"] => {
        const items: MenuProps["items"] = [];
        if (!categories.length) return [];

        // 🟢 Item "All"
        items.push({
            key: "all",
            label: "All",
        });

        // 🟢 Category cha + con
        categories.forEach((parent) => {
            if (parent.subcategories?.length) {
                items.push({
                    key: String(parent.id),
                    label: parent.name,
                    onTitleClick: () => handleSelect(parent.id),
                    children: parent.subcategories.map((child) => ({
                        key: String(child.id),
                        label: child.name,
                    })),
                });
            } else {
                items.push({
                    key: String(parent.id),
                    label: parent.name,
                });
            }
        });

        // 🟣 Others
        if (showUncategorized) {
            items.push({
                key: "-1",
                label: "Others",
            });
        }

        return items;
    };

    const handleSelect = (id: number | null) => {
        setSelectedId(id);
        onSelect?.(id);
    };

    const onClick: MenuProps["onClick"] = (e) => {
        const id =
            e.key === "all" ? null : e.key === "-1" ? -1 : Number(e.key);
        handleSelect(id);
    };

    return (
        <div>
            {loading ? (
                <Skeleton.Node active style={{ height: 46 }} />
            ) : (
                <Menu
                    mode="horizontal"
                    items={buildMenuItems()}
                    onClick={onClick}
                    selectedKeys={[selectedId?.toString() ?? "all"]}
                />
            )}
        </div>
    );
};

export { CategoryMenuSelector };
