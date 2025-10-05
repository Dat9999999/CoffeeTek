'use client';

import { Modal, Descriptions } from "antd";
import type { Topping } from "@/interfaces";

interface ToppingDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Topping | null;
}

export function ToppingDetailModal({ open, onClose, record }: ToppingDetailModalProps) {
    return (
        <Modal
            title="Topping Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Price">{record.price}</Descriptions.Item>
                    <Descriptions.Item label="Image Name">{record.image_name || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Sort Index">{record.sort_index}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}