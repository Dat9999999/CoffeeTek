// components/features/loyallevels/EditLoyalLevelModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { loyalLevelService } from "@/services/loyalLevelService";
import type { LoyalLevel } from "@/interfaces";

interface EditLoyalLevelModalProps {
    open: boolean;
    onClose: () => void;
    record?: LoyalLevel | null;
    onSuccess: (updatedLoyalLevel: LoyalLevel) => void;
}

export function EditLoyalLevelModal({ open, onClose, record, onSuccess }: EditLoyalLevelModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Khi record thay đổi, set dữ liệu vào form
    useEffect(() => {
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
        }
    }, [record, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;

            setLoading(true);
            const res = await loyalLevelService.update(record.id, values);

            message.success("Loyal level updated successfully!");
            onSuccess(res);
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Name already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Loyal Level"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please input loyal level name!" }]}
                >
                    <Input placeholder="Enter loyal level name" />
                </Form.Item>
                <Form.Item
                    name="requirePoint"
                    label="Require Point"
                    rules={[{ required: true, message: "Please input require point!" }]}
                >
                    <InputNumber defaultValue={record?.required_points} placeholder="Enter require point" style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}