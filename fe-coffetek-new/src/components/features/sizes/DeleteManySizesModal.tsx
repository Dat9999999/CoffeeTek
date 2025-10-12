'use client';

import { Modal, Button, message } from "antd";
import { sizeService } from "@/services/sizeService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManySizesModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteManySizesModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManySizesModalProps) {
    const handleDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one size to delete");
            return;
        }

        try {
            const result = await sizeService.deleteMany(selectedRowKeys);
            message.success(result.message || "Deleted successfully");

            // ✅ Tính lại số lượng phần tử còn lại sau khi xóa
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);

            // ✅ Nếu trang hiện tại > maxPage => lùi về trang trước
            const newPage = tableState.currentPage > maxPage && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            console.error(error);
            message.error("Failed to delete sizes");
        }
    };

    return (
        <Modal
            title="Delete Selected Sizes"
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
                Are you sure you want to delete{" "}
                <b>{selectedRowKeys.length}</b> selected size
                {selectedRowKeys.length > 1 ? "s" : ""}?
            </p>
        </Modal>
    );
}
