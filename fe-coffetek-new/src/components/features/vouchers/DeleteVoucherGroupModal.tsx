"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { voucherService, VoucherGroup } from "@/services/voucherService";
import { TableState } from "@/hooks/useTableState";

interface DeleteVoucherGroupModalProps {
    open: boolean;
    record: VoucherGroup | null; // Sử dụng type VoucherGroup
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteVoucherGroupModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteVoucherGroupModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            // Gọi API xóa theo group_name
            await voucherService.deleteByGroupName(record.group_name);
            message.success(`Deleted group "${record.group_name}" successfully.`);

            // Logic tính toán lại trang sau khi xóa
            const remaining = totalItems - 1;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage =
                tableState.currentPage > maxPage && tableState.currentPage > 1
                    ? tableState.currentPage - 1
                    : tableState.currentPage;

            onSuccess(false, newPage);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete voucher group.");
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
                Are you sure you want to delete group <b>{record?.group_name}</b>?
                <br />
                <span className="text-red-500 text-sm">
                    Warning: This will delete ALL vouchers belonging to this group.
                </span>
            </p>
        </Modal>
    );
}