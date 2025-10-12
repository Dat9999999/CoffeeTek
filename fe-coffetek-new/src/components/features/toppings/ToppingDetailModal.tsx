'use client';

import { Modal, Descriptions, Image } from "antd";
import type { Topping } from "@/interfaces";
import { formatPrice } from "@/utils";
import AppImage from "@/components/commons/AppImage";

interface ToppingDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Topping | null;
}

export function ToppingDetailModal({ open, onClose, record }: ToppingDetailModalProps) {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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
                    <Descriptions.Item label="Price">
                        {formatPrice(record.price, { includeSymbol: true })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Image">
                        {record.image_name ? (
                            <AppImage src={record.image_name} alt={record.name} />
                        ) : (
                            "No image"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sort Index">{record.sort_index}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
