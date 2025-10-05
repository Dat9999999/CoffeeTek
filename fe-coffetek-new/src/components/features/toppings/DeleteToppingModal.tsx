'use client';

import { Modal, message } from "antd";
import { useState } from "react";
import { toppingService } from "@/services/toppingService";
import type { Topping } from "@/interfaces";

interface DeleteToppingProps {
    open: boolean;
    record: Topping | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteToppingModal({ open, record, onClose, onSuccess }: DeleteToppingProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await toppingService.delete(record.id);
            message.success(`Đã xóa topping "${record.name}"`);
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Xóa thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Xác nhận xóa"
            okText="Xóa"
            okType="danger"
            confirmLoading={loading}
            onOk={handleDelete}
            onCancel={onClose}
        >
            <p>
                Bạn có chắc chắn muốn xóa topping <b>{record?.name}</b> không?
            </p>
        </Modal>
    );
}