'use client';
import { Modal, message } from "antd";
import { useState } from "react";
import { productService } from "@/services/productService";
import type { Product } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteProductProps {
    open: boolean;
    record: Product | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteProductModal({ open, record, onClose, onSuccess, totalItems, tableState }: DeleteProductProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await productService.delete(record.id);
            message.success(`Deleted product "${record.name}" successfully`);
            // Calculate remaining items on current page
            const remaining = (totalItems - 1) - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;
            onSuccess(false, newPage);
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Delete Confirmation"
            okText="Delete"
            okType="danger"
            confirmLoading={loading}
            onOk={handleDelete}
            onCancel={onClose}
        >
            <p>Are you sure you want to delete product <b>{record?.name}</b>?</p>
        </Modal>
    );
}
