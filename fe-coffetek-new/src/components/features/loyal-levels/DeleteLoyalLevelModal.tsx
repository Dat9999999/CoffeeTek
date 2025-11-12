// components/features/loyallevels/DeleteLoyalLevelModal.tsx
"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { loyalLevelService } from "@/services/loyalLevelService";
import type { LoyalLevel } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteLoyalLevelProps {
    open: boolean;
    record: LoyalLevel | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteLoyalLevelModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteLoyalLevelProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await loyalLevelService.delete(record.id);
            message.success(`Deleted loyal level "${record.name}" successfully.`);

            // Tính toán trang mới nếu xóa xong mà trang hiện tại không còn dữ liệu
            const remaining = (totalItems - 1) - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete loyal level.");
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
                Are you sure you want to delete loyal level <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}