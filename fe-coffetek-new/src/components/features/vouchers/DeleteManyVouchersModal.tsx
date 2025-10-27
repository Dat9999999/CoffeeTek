"use client";

import { Modal, Button, message } from "antd";
import { voucherService } from "@/services/voucherService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyVouchersModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyVouchersModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteManyVouchersModalProps) {
    const handleDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one voucher to delete");
            return;
        }

        try {
            const result = await voucherService.deleteMany(selectedRowKeys);
            message.success(result.message || "Vouchers deleted successfully");

            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage =
                tableState.currentPage > maxPage && tableState.currentPage > 1
                    ? tableState.currentPage - 1
                    : tableState.currentPage;

            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            console.error(error);
            message.error("Failed to delete vouchers");
        }
    };

    return (
        <Modal
            title="Delete Selected Vouchers"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="delete"
                    type="primary"
                    danger
                    onClick={handleDelete}
                    disabled={selectedRowKeys.length === 0}
                >
                    Delete
                </Button>,
            ]}
        >
            <p>
                Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected voucher
                {selectedRowKeys.length > 1 ? "s" : ""}?
            </p>
        </Modal>
    );
}