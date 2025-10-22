'use client';

import { Modal, Button, message } from "antd";
import { materialService } from "@/services/materialService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyMaterialsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyMaterialsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManyMaterialsModalProps) {
    const handleDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one material to delete");
            return;
        }

        try {
            // ⚙️ Giả định API backend có endpoint DELETE /material/many
            const result = await materialService.deleteMany(selectedRowKeys);
            message.success(result.message || "Deleted successfully");

            // ✅ Tính lại số lượng phần tử còn lại sau khi xóa
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);

            // ✅ Nếu trang hiện tại > maxPage => lùi về trang trước
            const newPage =
                tableState.currentPage > maxPage && tableState.currentPage > 1
                    ? tableState.currentPage - 1
                    : tableState.currentPage;

            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            console.error(error);
            message.error("Failed to delete materials");
        }
    };

    return (
        <Modal
            title="Delete Selected Materials"
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
                <b>{selectedRowKeys.length}</b> selected material
                {selectedRowKeys.length > 1 ? "s" : ""}?
            </p>
        </Modal>
    );
}
