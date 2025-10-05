"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { sizeService } from "@/services/sizeService";
import type { Size } from "@/interfaces";

interface EditSizeModalProps {
    open: boolean;
    onClose: () => void;
    record?: Size | null;
    onSuccess: (updatedSize: Size) => void;
}

export function EditSizeModal({ open, onClose, record, onSuccess }: EditSizeModalProps) {
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
            const res = await sizeService.update(record.id, values);

            message.success("Size updated successfully!");
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
            title="Edit Size"
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
                    rules={[{ required: true, message: "Please input size name!" }]}
                >
                    <Input placeholder="Enter size name" />
                </Form.Item>


            </Form>
        </Modal>
    );
}
