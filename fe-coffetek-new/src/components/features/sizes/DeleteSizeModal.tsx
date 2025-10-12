"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { sizeService } from "@/services/sizeService";
import type { Size } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteSizeProps {
    open: boolean;
    record: Size | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteSizeModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteSizeProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await sizeService.delete(record.id);
            message.success(`Deleted size "${record.name}" successfully.`);

            // Tính toán trang mới nếu xóa xong mà trang hiện tại không còn dữ liệu
            const remaining = (totalItems - 1) - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete size.");
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
                Are you sure you want to delete size <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}
