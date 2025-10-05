"use client";

import { Modal, message } from "antd";
import { useState } from "react";
import { sizeService } from "@/services/sizeService";
import type { Size } from "@/interfaces";

interface DeleteSizeProps {
    open: boolean;
    record: Size | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteSizeModal({ open, record, onClose, onSuccess }: DeleteSizeProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setLoading(true);
        try {
            await sizeService.delete(record.id); // API DELETE
            message.success(`Đã xóa size "${record.name}"`);
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
                Bạn có chắc chắn muốn xóa size{" "}
                <b>{record?.name}</b> không?
            </p>
        </Modal>
    );
}
