'use client';
import { Modal, Descriptions, Image } from "antd";
import type { Product } from "@/interfaces";
import { formatPrice } from "@/utils";
import AppImage from "@/components/commons/AppImage";

interface ProductDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Product | null;
}

export function ProductDetailModal({ open, onClose, record }: ProductDetailModalProps) {
    return (
        <Modal title="Product Details" open={open} onCancel={onClose} footer={null}>
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Category">{record.category?.name ?? "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Multi-size">{record.is_multi_size ? "Yes" : "No"}</Descriptions.Item>
                    <Descriptions.Item label="Price">
                        {record.is_multi_size ? "Multi-size" : formatPrice(record.price ?? 0, { includeSymbol: true })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">{record.product_detail ?? "No description"}</Descriptions.Item>
                    <Descriptions.Item label="Sizes">
                        {record.sizes && record.sizes.length > 0 ? (
                            <ul>
                                {record.sizes.map(s => (
                                    <li key={s.id}>Size {s.size_id}: {formatPrice(s.price, { includeSymbol: true })}</li>
                                ))}
                            </ul>
                        ) : "No sizes"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Images">
                        {record.images && record.images.length > 0 ? (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {record.images.map(img => (
                                    <AppImage key={img.id} src={img.image_name} alt={`product-${record.id}`} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                                ))}
                            </div>
                        ) : "No images"}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
