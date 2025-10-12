'use client';
import { Modal, message } from "antd";
import { useState } from "react";
import { optionGroupService } from "@/services/optionGroupService";
import type { OptionGroup } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteOptionGroupModalProps {
    open: boolean;
    record: OptionGroup | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteOptionGroupModal({ open, record, onClose, onSuccess, totalItems, tableState }: DeleteOptionGroupModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await optionGroupService.delete(record.id);
            message.success(`Deleted option group "${record.name}" successfully`);
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
                Are you sure you want to delete option group <b>{record?.name}</b>?
            </p>
        </Modal>
    );
}