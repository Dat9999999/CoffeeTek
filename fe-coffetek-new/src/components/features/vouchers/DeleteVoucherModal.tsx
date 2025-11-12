"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { voucherService } from "@/services/voucherService";
import type { Voucher } from "@/interfaces";
import { TableState } from "@/hooks/useTableState";

interface DeleteVoucherModalProps {
    open: boolean;
    record: Voucher | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteVoucherModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteVoucherModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await voucherService.delete(record.id!);
            message.success(`Deleted voucher "${record.code}" successfully.`);

            const remaining = totalItems - 1;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage =
                tableState.currentPage > maxPage && tableState.currentPage > 1
                    ? tableState.currentPage - 1
                    : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete voucher.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            title="Confirm Deletion"
            okText="Delete"
            okType="danger"
            confirmLoading={loading}
            onOk={handleDelete}
            onCancel={onClose}
        >
            <p>
                Are you sure you want to delete voucher <b>{record?.code}</b>?
            </p>
        </Modal>
    );
}