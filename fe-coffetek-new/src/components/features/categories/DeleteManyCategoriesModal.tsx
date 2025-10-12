'use client';
import { Modal, Button, message } from "antd";
import { categoryService } from "@/services/categoryService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyCategoriesModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyCategoriesModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteManyCategoriesModalProps) {
    const handleDelete = async () => {
        try {
            const result = await categoryService.deleteMany(selectedRowKeys);
            message.success(result.message);
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage = tableState.currentPage > maxPage && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;
            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            message.error("Failed to delete categories");
        }
    };

    return (
        <Modal
            title="Delete Selected Categories"
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
            <p>Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected category{selectedRowKeys.length > 1 ? "ies" : ""}? This will also delete all subcategories.</p>
        </Modal>
    );
}