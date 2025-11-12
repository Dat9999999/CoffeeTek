"use client";

import { useState } from "react";
import { Modal, Form, InputNumber, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { voucherService } from "@/services/voucherService";
import type { Voucher } from "@/interfaces";

interface CreateVoucherModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateVoucherModal({ open, onClose, onSuccess }: CreateVoucherModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const [validFrom, validTo] = values.validPeriod;

            // ✅ format với dayjs theo kiểu DD-MM-YYYY
            const payload = {
                ...values,
                validFrom: dayjs(validFrom).toISOString(),
                validTo: dayjs(validTo).toISOString(),
                discountRate: values.discount_percentage,
            };

            const res = await voucherService.create(payload);
            message.success("Voucher created successfully!");
            onSuccess();
            form.resetFields();
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
            title="Generate Voucher"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Generate"
            afterOpenChange={(visible) => {
                if (!visible) form.resetFields();
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="quantity"
                    label="How many vouchers to generate?"
                    rules={[{ required: true, message: "Please input quantity!" }]}
                >
                    <InputNumber min={1} placeholder="Enter quantity" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="discount_percentage"
                    label="Discount Percentage (%)"
                    rules={[{ required: true, message: "Please input discount percentage!" }]}
                >
                    <InputNumber
                        min={0}
                        max={100}
                        placeholder="Enter discount percentage"
                        style={{ width: "100%" }}
                    />
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
                    name="validPeriod"
                    label="Valid Period"
                    rules={[{ required: true, message: "Please select the valid period!" }]}
                >
                    <DatePicker.RangePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY" // ✅ hiển thị đúng format ngày đầy đủ
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
