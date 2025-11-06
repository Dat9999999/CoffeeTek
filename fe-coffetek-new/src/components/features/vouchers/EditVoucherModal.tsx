"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, message } from "antd";
import { voucherService } from "@/services/voucherService";
import type { Voucher } from "@/interfaces";
import dayjs from "dayjs";

interface EditVoucherModalProps {
    open: boolean;
    onClose: () => void;
    record?: Voucher | null;
    onSuccess: () => void;
}

export function EditVoucherModal({ open, onClose, record, onSuccess }: EditVoucherModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                ...record,
                validFrom: record.valid_from ? dayjs(record.valid_from) : null,
                validTo: record.valid_to ? dayjs(record.valid_to) : null,
            });
        } else {
            form.resetFields();
        }
    }, [record, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;

            setLoading(true);
            const payload = {
                ...values,
                validFrom: values.validFrom.toISOString(),
                validTo: values.validTo.toISOString(),
                discountRate: values.discount_percentage,
            };
            // const res = await voucherService.update(record.id!, payload);
            message.success("Voucher updated successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Voucher code already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Voucher"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="code"
                    label="Voucher Code"
                    rules={[{ required: true, message: "Please input voucher code!" }]}
                >
                    <Input placeholder="Enter voucher code" />
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[{ required: true, message: "Please input quantity!" }]}
                >
                    <InputNumber min={1} placeholder="Enter quantity" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="discount_percentage"
                    label="Discount Percentage (%)"
                    rules={[{ required: true, message: "Please input discount percentage!" }]}
                >
                    <InputNumber min={0} max={100} placeholder="Enter discount percentage" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="minAmountOrder"
                    label="Minimum Order Amount"
                    rules={[{ required: true, message: "Please input minimum order amount!" }]}
                >
                    <InputNumber min={0} placeholder="Enter minimum order amount" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="requirePoint"
                    label="Required Points"
                    rules={[{ required: true, message: "Please input required points!" }]}
                >
                    <InputNumber min={0} placeholder="Enter required points" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="validFrom"
                    label="Valid From"
                    rules={[{ required: true, message: "Please select valid from date!" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="validTo"
                    label="Valid To"
                    rules={[{ required: true, message: "Please select valid to date!" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}