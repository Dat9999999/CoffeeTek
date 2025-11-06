// components/features/loyallevels/LoyalLevelDetailModal.tsx
"use client";

import { Modal, Descriptions } from "antd";
import type { LoyalLevel } from "@/interfaces";

interface LoyalLevelDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: LoyalLevel | null;
}

export function LoyalLevelDetailModal({ open, onClose, record }: LoyalLevelDetailModalProps) {
    return (
        <Modal
            title="Loyal Level Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Require Point">{record.required_points}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}