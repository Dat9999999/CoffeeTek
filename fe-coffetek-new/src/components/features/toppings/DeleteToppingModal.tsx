'use client';

import { Modal, message } from "antd";
import { useState } from "react";
import { toppingService } from "@/services/toppingService";
import type { Topping } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteToppingProps {
    open: boolean;
    record: Topping | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteToppingModal({ open, record, onClose, onSuccess, totalItems, tableState }: DeleteToppingProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await toppingService.delete(record.id);
            message.success(`Deleted topping "${record.name}" successfully`);
            // Tính toán trang mới nếu xóa xong mà trang hiện tại không còn dữ liệu
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
                Are you sure you want to delete topping <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}
