'use client';
import { Modal, Button, message } from "antd";
import { productService } from "@/services/productService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyProductsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyProductsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManyProductsModalProps) {
    const handleDelete = async () => {
        try {
            // Assumes productService.deleteMany exists
            const res = await (productService as any).deleteMany(selectedRowKeys);
            message.success(res?.message || "Deleted selected products");
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.max(1, Math.ceil(remaining / tableState.pageSize));
            const newPage = tableState.currentPage > maxPage && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;
            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            message.error("Failed to delete products");
        }
    };

    return (
        <Modal
            title="Delete Selected Products"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="delete" type="primary" danger onClick={handleDelete}>Delete</Button>
            ]}
        >
            <p>Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected product{selectedRowKeys.length > 1 ? "s" : ""}?</p>
        </Modal>
    );
}
