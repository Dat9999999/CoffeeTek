"use client";

import { Modal, Button, message } from "antd";
import { promotionService } from "@/services/promotionService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyPromotionsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyPromotionsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteManyPromotionsModalProps) {
    const handleDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one promotion to delete");
            return;
        }

        try {
            const result = await promotionService.deleteMany(selectedRowKeys);
            message.success(result.message || "Deleted successfully");

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
            message.error("Failed to delete promotions");
        }
    };

    return (
        <Modal
            title="Delete Selected Promotions"
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
                Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected promotion
                {selectedRowKeys.length > 1 ? "s" : ""}?
            </p>
        </Modal>
    );
}