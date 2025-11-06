// components/features/wastage-logs/DeleteWastageLogModal.tsx
'use client';

import { Modal, message } from "antd";
import { useState } from "react";
import { wastageLogService } from "@/services/wastageLogService";
import type { WastageLog } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteWastageLogProps {
    open: boolean;
    record: WastageLog | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteWastageLogModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteWastageLogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            // ✅ Đã thay đổi service (dùng remove)
            await wastageLogService.remove(record.id);
            message.success(`Deleted log (ID: ${record.id}) successfully.`);

            // Tính toán trang mới nếu xóa xong mà trang hiện tại không còn dữ liệu
            const remaining = (totalItems - 1) - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete log.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            title="Confirm deletion"
            okText="Delete"
            okType="danger"
            confirmLoading={loading}
            onOk={handleDelete}
            onCancel={onClose}
        >
            <p>
                Are you sure you want to delete this wastage log (ID: <b>{record?.id}</b>)?
            </p>
            <p>
                Material: <b>{record?.Mateterial?.name}</b>, Quantity: <b>{record?.quantity}</b>
            </p>
        </Modal>
    );
}