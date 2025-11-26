"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { voucherService } from "@/services/voucherService";
import { TableState } from "@/hooks/useTableState";

interface DeleteManyVoucherGroupsModalProps {
    open: boolean;
    selectedGroupNames: React.Key[]; // Danh sách group_name được chọn
    onClose: () => void;
    onSuccess: (isDeleteMany: boolean, newPage?: number) => void;
    totalItems: number;
    tableState: TableState;
}

export function DeleteManyVoucherGroupsModal({
    open,
    selectedGroupNames,
    onClose,
    onSuccess,
    totalItems,
    tableState,
}: DeleteManyVoucherGroupsModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDeleteMany = async () => {
        if (selectedGroupNames.length === 0) return;
        setLoading(true);
        try {
            // YÊU CẦU: Sử dụng vòng lặp để xóa từng group
            // Cách 1: Chạy tuần tự (nếu muốn đảm bảo thứ tự hoặc backend yếu)
            /*
            for (const groupName of selectedGroupNames) {
                 await voucherService.deleteByGroupName(groupName as string);
            }
            */

            // Cách 2: Chạy song song (nhanh hơn) bằng Promise.all trong vòng lặp map
            const deletePromises = selectedGroupNames.map((groupName) =>
                voucherService.deleteByGroupName(groupName as string)
            );

            await Promise.all(deletePromises);

            message.success(`Deleted ${selectedGroupNames.length} groups successfully.`);

            // Logic tính toán lại trang
            const remaining = totalItems - selectedGroupNames.length;
            const maxPage = Math.ceil(remaining / tableState.pageSize);
            const newPage =
                tableState.currentPage > maxPage && tableState.currentPage > 1
                    ? tableState.currentPage - 1
                    : tableState.currentPage;

            onSuccess(true, newPage);
        } catch (error: any) {
            console.error(error);
            message.error("Some groups could not be deleted.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            title="Confirm Bulk Deletion"
            okText="Delete All"
            okType="danger"
            confirmLoading={loading}
            onOk={handleDeleteMany}
            onCancel={onClose}
        >
            <p>
                Are you sure you want to delete <b>{selectedGroupNames.length}</b> selected groups?
            </p>
            {/* <ul className="list-disc pl-5 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {selectedGroupNames.map((name) => (
                    <li key={name} className="text-sm text-gray-600">{name}</li>
                ))}
            </ul> */}
        </Modal>
    );
}