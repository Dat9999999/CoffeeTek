"use client";

import { useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { sizeService } from "@/services/sizeService";
import type { Size } from "@/interfaces";

interface CreateSizeModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newSize: Size) => void;
}

export function CreateSizeModal({ open, onClose, onSuccess }: CreateSizeModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await sizeService.create(values);
            message.success("Size created successfully!");
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
            title="Create Size"
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
                    rules={[{ required: true, message: "Please input size name!" }]}
                >
                    <Input placeholder="Enter size name" />
                </Form.Item>


            </Form>
        </Modal>
    );
}
