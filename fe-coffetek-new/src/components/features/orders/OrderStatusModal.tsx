"use client";

import { Modal, Button, message, Segmented } from "antd";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/interfaces";
import { useState, useEffect } from "react";

interface OrderStatusModalProps {
    open: boolean;
    order: Order | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function OrderStatusModal({ open, order, onClose, onSuccess }: OrderStatusModalProps) {
    if (!order) return null;

    const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

    // Define available transitions based on current status
    const availableStatuses: { label: string; value: OrderStatus }[] = [];

    switch (order.status) {
        case OrderStatus.PENDING:
            availableStatuses.push(
                { label: "Mark as Paid", value: OrderStatus.PAID },
                { label: "Cancel", value: OrderStatus.CANCELED }
            );
            break;
        case OrderStatus.PAID:
            availableStatuses.push(
                { label: "Complete", value: OrderStatus.COMPLETED },
                { label: "Refund", value: OrderStatus.REFUND },
                { label: "Cancel", value: OrderStatus.CANCELED }
            );
            break;
        case OrderStatus.COMPLETED:
            availableStatuses.push({ label: "Refund", value: OrderStatus.REFUND });
            break;
        case OrderStatus.CANCELED:
        case OrderStatus.REFUND:
            // no further transitions
            break;
    }

    // ✅ Reset state khi modal mở hoặc order đổi
    useEffect(() => {
        if (open) {
            if (availableStatuses.length > 0) {
                setNewStatus(availableStatuses[0].value);
            } else {
                setNewStatus(null);
            }
        } else {
            setNewStatus(null);
        }
    }, [open, order?.status]);

    const handleUpdateStatus = async () => {
        if (!newStatus) {
            message.error("Please select a new status");
            return;
        }
        try {
            await orderService.updateStatus({
                orderId: order.id,
                status: newStatus,
            });
            message.success(`Order status updated to ${newStatus.toUpperCase()}`);
            onSuccess();
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    return (
        <Modal
            open={open}
            title={`Update Status for Order #${order.id}`}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus}
                >
                    Confirm
                </Button>,
            ]}
        >
            <p>
                Current Status: <strong>{order.status.toUpperCase()}</strong>
            </p>

            {availableStatuses.length > 0 ? (
                <Segmented
                    options={availableStatuses}
                    value={newStatus ?? undefined}
                    onChange={(value) => setNewStatus(value as OrderStatus)}
                    block
                />
            ) : (
                <p>No available status changes.</p>
            )}
        </Modal>
    );
}
