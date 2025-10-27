"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { promotionService } from "@/services/promotionService";
import type { Promotion } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeletePromotionModalProps {
    open: boolean;
    record: Promotion | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeletePromotionModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeletePromotionModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await promotionService.delete(record.id);
            message.success(`Deleted promotion "${record.name}" successfully.`);

            const remaining = totalItems - 1 - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete promotion.");
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
                Are you sure you want to delete promotion <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}