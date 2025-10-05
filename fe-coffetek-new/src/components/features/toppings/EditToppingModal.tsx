'use client';

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { toppingService } from "@/services/toppingService";
import type { Topping } from "@/interfaces";

interface EditToppingModalProps {
    open: boolean;
    onClose: () => void;
    record?: Topping | null;
    onSuccess: (updatedTopping: Topping) => void;
}

export function EditToppingModal({ open, onClose, record, onSuccess }: EditToppingModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

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
            const res = await toppingService.update(record.id, values);
            message.success("Topping updated successfully!");
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
            title="Edit Topping"
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
                    rules={[{ required: true, message: "Please input topping name!" }]}
                >
                    <Input placeholder="Enter topping name" />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: "Please input price!" }]}
                >
                    <InputNumber min={0} placeholder="Enter price" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="image_name"
                    label="Image Name"
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Enter image name (optional)" />
                </Form.Item>
            </Form>
        </Modal>
    );
}