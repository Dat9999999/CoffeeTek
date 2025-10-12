'use client';
import { Modal, Button, message } from "antd";
import { optionGroupService } from "@/services/optionGroupService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyOptionGroupsModalProps {
    open: boolean;
    selectedRowKeys: number[];
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState
}

export function DeleteManyOptionGroupsModal({
    open,
    selectedRowKeys,
    onClose,
    onSuccess,
    totalItems,
    tableState
}: DeleteManyOptionGroupsModalProps) {
    const handleDelete = async () => {
        try {
            const result = await optionGroupService.deleteMany(selectedRowKeys);
            message.success(result.message);
            const remaining = totalItems - selectedRowKeys.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage = tableState.currentPage > maxPage && tableState.currentPage > 1
                ? tableState.currentPage - 1
                : tableState.currentPage;
            onSuccess(true, newPage);
            onClose();
        } catch (error) {
            message.error("Failed to delete option groups");
        }
    };

    return (
        <Modal
            title="Delete Selected Option Groups"
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
            <p>Are you sure you want to delete <b>{selectedRowKeys.length}</b> selected option group{selectedRowKeys.length > 1 ? "s" : ""}?</p>
        </Modal>
    );
}