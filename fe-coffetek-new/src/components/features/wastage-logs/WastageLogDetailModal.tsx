// components/features/wastage-logs/WastageLogDetailModal.tsx
'use client';

import { Modal, Descriptions } from "antd";
import type { WastageLog } from "@/interfaces";

interface WastageLogDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: WastageLog | null;
}

export function WastageLogDetailModal({ open, onClose, record }: WastageLogDetailModalProps) {
    return (
        <Modal
            title="Wastage Log Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    {/* ✅ Dùng 'Mateterial' (sai chính tả) như trong interface */}
                    <Descriptions.Item label="Material">
                        {record.Mateterial?.name || `(ID: ${record.materialId})`}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">{record.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Reason">{record.reason}</Descriptions.Item>
                    <Descriptions.Item label="Date">
                        {new Date(record.date).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Recorded By">
                        {record.User?.first_name || `N/A`}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}