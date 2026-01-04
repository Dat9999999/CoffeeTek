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
            message.success("Xóa thầu khoáng thành công!");

            // Tính toán trang mới nếu cần
            const currentPageItems = totalItems - (tableState.currentPage - 1) * tableState.pageSize;
            const newPage = currentPageItems <= 1 && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : undefined;

            onSuccess(newPage);
            onClose();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra khi xóa!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: "red" }} />
                    <span>Xác nhận xóa</span>
                </div>
            }
            open={open}
            onOk={handleDelete}
            onCancel={onClose}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            // icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
        >
            <p>
                Bạn có chắc chắn muốn xóa thầu khoáng này không?
                <br />
                {record && (
                    <>
                        <strong>Nguyên liệu:</strong> {record.Material?.name || "N/A"}
                        <br />
                        <strong>Số lượng:</strong> {record.quantity}
                    </>
                )}
            </p>
        </Modal>
    );
}



