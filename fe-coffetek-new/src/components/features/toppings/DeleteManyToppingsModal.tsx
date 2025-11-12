'use client';

import { Modal, Button, message } from "antd";
import { toppingService } from "@/services/toppingService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyToppingsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteManyToppingsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManyToppingsModalProps) {
    const handleDelete = async () => {
        try {
            const result = await toppingService.deleteMany(selectedRowKeys);
            message.success(result.message);
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
            message.error("Failed to delete toppings");
        }
    };

    return (
        <Modal
            title="Delete Selected Toppings"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="delete" type="primary" danger onClick={handleDelete}>
                    Delete
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected topping{selectedRowKeys.length > 1 ? "s" : ""}</p>
        </Modal>
    );
}