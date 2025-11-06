// components/features/wastage-logs/CreateWastageLogModal.tsx
'use client';

import { useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { CreateWastageLogDto, wastageLogService } from "@/services/wastageLogService";
import type { WastageLog, Material } from "@/interfaces";
import { MaterialSearchSelector } from "../materials";

interface CreateWastageLogModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newLog: WastageLog) => void;
}

interface WastageLogCreateFormData extends Omit<CreateWastageLogDto, 'date'> { }

export function CreateWastageLogModal({ open, onClose, onSuccess }: CreateWastageLogModalProps) {
    const [form] = Form.useForm<WastageLogCreateFormData>();
    const [loading, setLoading] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null); // ✅ lưu material được chọn

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!selectedMaterial) {
                message.warning("Please select a material!");
                return;
            }

            const payload: CreateWastageLogDto = {
                ...values,
                materialId: selectedMaterial.id, // ✅ lấy id từ material đã chọn
                date: new Date().toISOString(),
            };

            setLoading(true);
            const res = await wastageLogService.create(payload);
            message.success("Wastage log created successfully!");
            onSuccess(res);
            form.resetFields();
            setSelectedMaterial(null);
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Conflict occurred!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Wastage Log"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setSelectedMaterial(null);
                }
            }}
        >
            <Form form={form} layout="vertical">
                {/* ✅ Thay input number bằng search select */}
                <Form.Item
                    label="Material"
                    required
                    tooltip="Search material by name or code"
                >
                    <MaterialSearchSelector
                        onSelect={(material) => setSelectedMaterial(material)}
                    />
                </Form.Item>

                <Form.Item
                    name="quantity"
                    label={
                        selectedMaterial
                            ? `Quantity (${selectedMaterial.unit?.name || selectedMaterial.unit?.symbol || ''})`
                            : "Quantity"
                    }
                    rules={[{ required: true, message: "Please input quantity!" }]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Enter quantity"
                        addonAfter={selectedMaterial?.unit?.symbol || selectedMaterial?.unit?.name || ''}
                    />
                </Form.Item>


                <Form.Item
                    name="reason"
                    label="Reason"
                    rules={[{ required: true, message: "Please input a reason!" }]}
                >
                    <Input.TextArea rows={4} placeholder="Enter reason for wastage" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
