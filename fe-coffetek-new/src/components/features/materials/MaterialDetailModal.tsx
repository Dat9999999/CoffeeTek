"use client";

import { useEffect, useState } from "react";
import { Modal, Descriptions, Spin, message } from "antd";
import type { Material } from "@/interfaces";
import { materialService } from "@/services/materialService";

interface MaterialDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Material | null;
}

export function MaterialDetailModal({ open, onClose, record }: MaterialDetailModalProps) {
    const [detail, setDetail] = useState<Material | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && record?.id) {
            setLoading(true);
            materialService
                .getById(record.id)
                .then((res) => setDetail(res))
                .catch(() => message.error("Failed to load material details"))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
        }
    }, [open, record]);

    return (
        <Modal
            title="Material Details"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin />
                </div>
            ) : detail ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{detail.name}</Descriptions.Item>
                    <Descriptions.Item label="Remain">{detail.remain}</Descriptions.Item>
                    <Descriptions.Item label="Code">{detail.code}</Descriptions.Item>
                    <Descriptions.Item label="Unit Name">{detail.unit?.name}</Descriptions.Item>
                    <Descriptions.Item label="Unit Symbol">{detail.unit?.symbol}</Descriptions.Item>
                    <Descriptions.Item label="Unit Class">{detail.unit?.class}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
