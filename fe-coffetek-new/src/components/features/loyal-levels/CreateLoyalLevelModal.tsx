// components/features/loyallevels/CreateLoyalLevelModal.tsx
"use client";

import { useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { loyalLevelService } from "@/services/loyalLevelService";
import type { LoyalLevel } from "@/services/loyalLevelService";

interface CreateLoyalLevelModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newLoyalLevel: LoyalLevel) => void;
}

export function CreateLoyalLevelModal({ open, onClose, onSuccess }: CreateLoyalLevelModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await loyalLevelService.create(values);
            message.success("Loyal level created successfully!");
            onSuccess(res);
            form.resetFields();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Name already exists!");
            } else if (!err.errorFields) {
                // Nếu không phải error validate Form
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Loyal Level"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) form.resetFields();
            }}
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
                    <InputNumber placeholder="Enter require point" style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}