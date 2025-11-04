// components/features/wastage-logs/EditWastageLogModal.tsx
'use client';

import { useEffect, useState } from "react";
import { Modal, Form, Input, message, InputNumber } from "antd";
import {
    UpdateWastageLogDto,
    wastageLogService
} from "@/services/wastageLogService";
import type { WastageLog, Material } from "@/interfaces";
import { MaterialSearchSelector, MaterialSearchSelectorV2 } from "../materials";

interface EditWastageLogModalProps {
    open: boolean;
    onClose: () => void;
    record?: WastageLog | null;
    onSuccess: (updatedLog: WastageLog) => void;
}

export function EditWastageLogModal({ open, onClose, record, onSuccess }: EditWastageLogModalProps) {
    const [form] = Form.useForm<Omit<UpdateWastageLogDto, "date">>();
    const [loading, setLoading] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(record?.Mateterial ?? null);
    console.log(selectedMaterial)
    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                quantity: record.quantity,
                reason: record.reason,
            });
            setSelectedMaterial(record.Mateterial || null); // chú ý Mateterial (backend typo)
        } else {
            form.resetFields();
            setSelectedMaterial(null);
        }
    }, [record, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record || !selectedMaterial) return;

            const payload: UpdateWastageLogDto = {
                ...values,
                materialId: selectedMaterial.id,
                date: new Date().toISOString(),
            };

            setLoading(true);
            const res = await wastageLogService.update(record.id, payload);
            message.success("Wastage log updated successfully!");
            onSuccess(res);
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
            title="Edit Wastage Log"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Material" required>
                    <MaterialSearchSelectorV2
                        selectedValue={selectedMaterial}
                        onSelect={(material) => setSelectedMaterial(material)}
                        style={{ width: "100%" }}
                    />
                    {selectedMaterial && (
                        <div style={{ marginTop: 8, color: '#888' }}>
                            Selected: {selectedMaterial.name} ({selectedMaterial.unit?.symbol || selectedMaterial.Unit?.symbol || "-"})
                        </div>
                    )}
                </Form.Item>

                <Form.Item
                    name="quantity"
                    label={
                        selectedMaterial
                            ? `Quantity (${selectedMaterial.unit?.name || selectedMaterial.unit?.symbol || selectedMaterial.Unit?.name || selectedMaterial.Unit?.symbol || ''})`
                            : "Quantity"
                    }
                    rules={[{ required: true, message: "Please input quantity!" }]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Enter quantity"
                        addonAfter={selectedMaterial?.unit?.symbol || selectedMaterial?.unit?.name || selectedMaterial?.Unit?.symbol || selectedMaterial?.Unit?.name || ''}
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
