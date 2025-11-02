// src/components/features/orders/OrderDeleteModal.tsx
// (Placeholder for DeleteOrderModal - similar to DeleteProductModal)
"use client";

import { Modal, Button, message } from "antd";
import { orderService } from "@/services/orderService";
import type { Order } from "@/interfaces";
import type { TableState } from "@/hooks/useTableState";

interface OrderDeleteModalProps {
    open: boolean;
    record: Order | null;
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function OrderDeleteModal({
    open,
    record,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: OrderDeleteModalProps) {
    if (!record) return null;

    const handleDelete = async () => {
        try {
            await orderService.delete(record.id);
            message.success("Order deleted successfully");

            let newPage = tableState.currentPage;
            if (totalItems - 1 <= (tableState.currentPage - 1) * tableState.pageSize) {
                newPage = Math.max(1, tableState.currentPage - 1);
            }
            onSuccess(false, newPage);
        } catch (error) {
            message.error("Failed to delete order");
        }
    };

    return (
        <Modal
            open={open}
            title="Delete Order"
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
            Are you sure you want to delete order #{record.id}?
        </Modal>
    );
}