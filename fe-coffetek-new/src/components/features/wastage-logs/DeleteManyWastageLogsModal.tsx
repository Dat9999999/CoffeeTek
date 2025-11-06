// components/features/wastage-logs/DeleteManyWastageLogsModal.tsx
'use client';

import { Modal, Button, message } from "antd";
import { wastageLogService } from "@/services/wastageLogService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyWastageLogsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyWastageLogsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManyWastageLogsModalProps) {
    const handleDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one log to delete");
            return;
        }

        try {
            // ✅ Đã thay đổi service (dùng removeMany)
            const result = await wastageLogService.removeMany(selectedRowKeys);
            message.success(result.message || "Deleted successfully");

            // Tính lại số lượng phần tử còn lại sau khi xóa
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);

            // Nếu trang hiện tại > maxPage => lùi về trang trước
            const newPage = tableState.currentPage > maxPage && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;

            onSuccess(true, newPage);
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to delete logs");
        }
    };

    return (
        <Modal
            title="Delete Selected Logs"
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
                <b>{selectedRowKeys.length}</b> selected log
                {selectedRowKeys.length > 1 ? "s" : ""}?
            </p>
        </Modal>
    );
}