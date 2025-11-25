"use client";

import { Modal, Descriptions } from "antd";
import type { Voucher } from "@/interfaces";
import dayjs from "dayjs";
import { formatPrice } from "@/utils";

interface VoucherDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Voucher | null;
}

export function VoucherDetailModal({ open, onClose, record }: VoucherDetailModalProps) {
    return (
        <Modal
            title="Voucher Details"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            {record ? (
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="Code">{record.code}</Descriptions.Item>
                    <Descriptions.Item label="Discount Percentage">{record.discount_percentage}%</Descriptions.Item>
                    <Descriptions.Item label="Minimum Order Amount">{formatPrice(record.minAmountOrder, { includeSymbol: true })}</Descriptions.Item>
                    <Descriptions.Item label="Required Points">{record.requirePoint}</Descriptions.Item>
                    <Descriptions.Item label="Valid From">
                        {dayjs(record.valid_from).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Valid To">
                        {dayjs(record.valid_to).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        {record.is_active ? "Active" : "Inactive"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Phone">
                        {record.customerPhone || "N/A"}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}