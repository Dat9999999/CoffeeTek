'use client';

import { useEffect, useState } from "react";
import { TreeSelect, theme } from "antd";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/interfaces";

interface CategoryFilterProps {
    value?: number | null;
    onChange?: (value: number | null) => void;
    showUncategorized?: boolean;
    placeholder?: string;
}

export function CategorySelector({
    value,
    onChange,
    showUncategorized = true,
    placeholder = "Filter by category"
}: CategoryFilterProps) {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getAll({ size: 1000, orderBy: "sort_index", orderDirection: "asc" });
            const categories: Category[] = res.data;

            // Xây dựng cây category
            const buildTree = (items: Category[], parentId: number | null = null): any[] =>
                items
                    .filter((c) => c.parent_category_id === parentId)
                    .map((c) => ({
                        title: c.name,
                        value: c.id,
                        key: c.id,
                        children: buildTree(items, c.id),
                    }));

            const builtTree = buildTree(categories);

            // Đưa "Chưa phân loại" xuống cuối nếu bật
            const finalTree = showUncategorized
                ? [
                    ...builtTree,
                    {
                        title: "Others",
                        value: -1,
                        key: "uncategorized",
                        isLeaf: true,
                    },
                ]
                : builtTree;

            setTreeData(finalTree);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [showUncategorized]);

    return (
        <TreeSelect
            allowClear
            showSearch
            loading={loading}
            placeholder={placeholder}
            style={{
                marginRight: token.marginXS,
                minWidth: 100,
            }}
            treeData={treeData}
            value={value ?? undefined}
            onChange={(val) => onChange?.(val ?? null)}
            treeDefaultExpandAll
            popupMatchSelectWidth={false}

        />
    );
}
