'use client';
import { Modal, message } from "antd";
import { useState } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteCategoryProps {
    open: boolean;
    record: Category | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteCategoryModal({ open, record, onClose, onSuccess, totalItems, tableState }: DeleteCategoryProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await categoryService.delete(record.id);
            message.success(`Deleted category "${record.name}" successfully`);
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
            <p>
                Are you sure you want to delete category <b>{record?.name}</b>? This will also delete all subcategories.
            </p>
        </Modal>
    );
}