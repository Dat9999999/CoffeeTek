'use client';

import { useEffect, useState } from "react";
import { Modal, Form, InputNumber, DatePicker, Select, message, Spin } from "antd";
import { contractingService, type Contracting, type UpdateContractingDto } from "@/services/contractingService";
import { materialService } from "@/services/materialService";
import type { Material } from "@/interfaces";
import dayjs from "dayjs";

interface EditContractingModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contracting: Contracting | null;
}

export function EditContractingModal({ 
    open, 
    onClose, 
    onSuccess,
    contracting 
}: EditContractingModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    useEffect(() => {
        if (open && contracting) {
            fetchMaterials();
            form.setFieldsValue({
                date: dayjs(contracting.created_at),
                quantity: contracting.quantity,
                materialId: contracting.materialId,
            });
        }
    }, [open, contracting]);

    const fetchMaterials = async () => {
        try {
            setLoadingMaterials(true);
            const res = await materialService.getAll({ page: 1, size: 1000 });
            setMaterials(res.data);
        } catch (error) {
            message.error("Failed to load materials list!");
        } finally {
            setLoadingMaterials(false);
        }
    };

    const handleSubmit = async () => {
        if (!contracting) return;
        
        try {
            const values = await form.validateFields();
            setLoading(true);
            const data: UpdateContractingDto = {
                date: values.date.toDate(),
                quantity: values.quantity,
            };
            await contractingService.update(contracting.id, data);
            message.success("Material contracting updated successfully!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 400) {
                message.error(err.response.data?.message || "Insufficient stock!");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Material Contracting"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
            cancelText="Cancel"
            afterOpenChange={(visible) => {
                if (!visible) form.resetFields();
            }}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true, message: "Please select a date!" }]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Select Date"
                    />
                </Form.Item>

                <Form.Item
                    name="materialId"
                    label="Material"
                >
                    <Select
                        disabled
                        options={materials.map((m) => ({
                            label: `${m.name} (${m.code})`,
                            value: m.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[
                        { required: true, message: "Please enter quantity!" },
                        { type: "number", min: 1, message: "Quantity must be greater than 0!" },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Enter Quantity"
                        min={1}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}



