'use client';
import { useEffect, useState } from "react";
import { Modal, Descriptions, message } from "antd";
import type { Category, CategoryDetail } from "@/interfaces";
import { categoryService } from "@/services/categoryService";



interface CategoryDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Category | null;
}

export function CategoryDetailModal({ open, onClose, record }: CategoryDetailModalProps) {
    const [detail, setDetail] = useState<CategoryDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && record?.id) {
            setLoading(true);
            categoryService
                .getById(record.id)
                .then((res) => setDetail(res))
                .catch(() => message.error("Failed to load details"))
                .finally(() => setLoading(false));
        }
    }, [open, record]);

    return (
        <Modal title="Category Details" open={open} onCancel={onClose} footer={null} confirmLoading={loading}>
            {detail ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{detail.name}</Descriptions.Item>
                    <Descriptions.Item label="Is Parent Category">
                        {detail.is_parent_category ? "Yes" : "No"}
                    </Descriptions.Item>
                    {!detail.is_parent_category && (
                        <Descriptions.Item label="Parent Category">
                            {detail.parent_category ? detail.parent_category.name : "N/A"}
                        </Descriptions.Item>
                    )}
                    {detail.is_parent_category && (
                        <Descriptions.Item label="Subcategories">
                            {detail.subcategories?.length
                                ? detail.subcategories.map((sub) => sub.name).join(", ")
                                : "None"}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Sort Index">{detail.sort_index}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}