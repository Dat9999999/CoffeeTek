'use client';

import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { contractingService, type Contracting } from "@/services/contractingService";
import { TableState } from "@/hooks/useTableState";

interface DeleteContractingModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newPage?: number) => void;
    record: Contracting | null;
    totalItems: number;
    tableState: TableState;
}

export function DeleteContractingModal({
    open,
    onClose,
    onSuccess,
    record,
    totalItems,
    tableState,
}: DeleteContractingModalProps) {
    const handleDelete = async () => {
        if (!record) return;

        try {
            await contractingService.delete(record.id);
            message.success("Material contracting deleted successfully!");

            // Tính toán trang mới nếu cần
            const currentPageItems = totalItems - (tableState.currentPage - 1) * tableState.pageSize;
            const newPage = currentPageItems <= 1 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : undefined;

            onSuccess(newPage);
            onClose();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "An error occurred while deleting!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "red" }} />
                    <span>Confirm Delete</span>
                </div>
            }
            open={open}
            onOk={handleDelete}
            onCancel={onClose}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            // icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
        >
            <p>
                Are you sure you want to delete this material contracting?
                <br />
                {record && (
                    <>
                        <strong>Material:</strong> {record.Material?.name || "N/A"}
                        <br />
                        <strong>Quantity:</strong> {record.quantity}
                    </>
                )}
            </p>
        </Modal>
    );
}



