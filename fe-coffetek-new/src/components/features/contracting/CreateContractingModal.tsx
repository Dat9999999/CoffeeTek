'use client';

import { useEffect, useState } from "react";
import { Modal, Form, InputNumber, DatePicker, Select, message, Spin } from "antd";
import { contractingService, type CreateContractingDto } from "@/services/contractingService";
import { materialService } from "@/services/materialService";
import type { Material } from "@/interfaces";
import dayjs, { Dayjs } from "dayjs";

interface CreateContractingModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultDate?: Date;
}

export function CreateContractingModal({ 
    open, 
    onClose, 
    onSuccess,
    defaultDate 
}: CreateContractingModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    useEffect(() => {
        if (open) {
            fetchMaterials();
            if (defaultDate) {
                form.setFieldsValue({ date: dayjs(defaultDate) });
            }
        }
    }, [open, defaultDate]);

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
        try {
            const values = await form.validateFields();
            setLoading(true);
            const data: CreateContractingDto = {
            // Sửa dòng này: Chuyển sang ISO String để Backend dễ validate
            date: values.date.toISOString(), 
            quantity: values.quantity,
            materialId: values.materialId,
        };
            await contractingService.create(data);
            message.success("Material contracting created successfully!");
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
            title="Add Material Contracting"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
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
                    rules={[{ required: true, message: "Please select a material!" }]}
                >
                    {loadingMaterials ? (
                        <Spin />
                    ) : (
                        <Select
                            placeholder="Select Material"
                            options={materials.map((m) => ({
                                label: `${m.name} (${m.code}) - Stock: ${m.remain} ${m.unit?.symbol || ""}`,
                                value: m.id,
                            }))}
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    )}
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



