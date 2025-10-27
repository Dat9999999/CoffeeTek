"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, message } from "antd";
import { promotionService } from "@/services/promotionService";
import type { Promotion } from "@/interfaces";
import dayjs from "dayjs";

interface EditPromotionModalProps {
    open: boolean;
    onClose: () => void;
    record?: Promotion | null;
    onSuccess: (updatedPromotion: Promotion) => void;
}

export function EditPromotionModal({ open, onClose, record, onSuccess }: EditPromotionModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                ...record,
                validPeriod: record.startDate && record.endDate
                    ? [dayjs(record.startDate), dayjs(record.endDate)]
                    : null,
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
            const [startDate, endDate] = values.validPeriod || [];
            const formattedValues = {
                ...values,
                startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
                endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
                validPeriod: undefined, // Loại bỏ validPeriod khỏi payload
            };

            const res = await promotionService.update(record.id, formattedValues);

            message.success("Promotion updated successfully!");
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
            title="Edit Promotion"
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
                    rules={[{ required: true, message: "Please input promotion name!" }]}
                >
                    <Input placeholder="Enter promotion name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please input description!" }]}
                >
                    <Input.TextArea placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                    name="validPeriod"
                    label="Valid Period"
                    rules={[{ required: true, message: "Please select the valid period!" }]}
                >
                    <DatePicker.RangePicker
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}