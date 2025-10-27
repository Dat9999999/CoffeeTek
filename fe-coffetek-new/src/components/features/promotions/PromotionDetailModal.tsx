"use client";

import { Modal, Descriptions } from "antd";
import dayjs from "dayjs";
import type { Promotion } from "@/interfaces";

interface PromotionDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Promotion | null;
}

export function PromotionDetailModal({ open, onClose, record }: PromotionDetailModalProps) {
    const formatDate = (date?: string | Date | null) => {
        return date ? dayjs(date).format("DD-MM-YYYY") : "-";
    };

    return (
        <Modal
            title="Promotion Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Description">{record.description}</Descriptions.Item>
                    <Descriptions.Item label="Start Date">
                        {formatDate(record.start_date)}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Date">
                        {formatDate(record.end_date)}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
