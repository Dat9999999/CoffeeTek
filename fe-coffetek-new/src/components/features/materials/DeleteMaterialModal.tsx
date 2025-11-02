"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { materialService } from "@/services";
import type { Material, Size } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteMaterialProps {
    open: boolean;
    record: Material | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteMaterialModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteMaterialProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await materialService.delete(record.id);
            message.success(`Deleted material "${record.name}" successfully.`);

            // Tính toán trang mới nếu xóa xong mà trang hiện tại không còn dữ liệu
            const remaining = (totalItems - 1) - (tableState.pageSize * (tableState.currentPage - 1));
            const newPage = remaining === 0 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete material.");
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
                Are you sure you want to delete material <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}
