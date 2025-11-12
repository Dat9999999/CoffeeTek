"use client";

import { Modal, Descriptions } from "antd";
import type { Size } from "@/interfaces";

interface SizeDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Size | null;
}

export function SizeDetailModal({ open, onClose, record }: SizeDetailModalProps) {
    return (
        <Modal
            title="Size Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Sort Index">{record.sort_index}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
