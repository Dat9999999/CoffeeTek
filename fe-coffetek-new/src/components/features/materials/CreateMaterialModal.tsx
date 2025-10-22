'use client';

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Spin } from "antd";
import { materialService } from "@/services/materialService";
import type { Material, Unit } from "@/interfaces";

interface CreateMaterialModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newMaterial: Material) => void;
}

export function CreateMaterialModal({ open, onClose, onSuccess }: CreateMaterialModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    // Fetch danh sách Unit khi mở modal
    useEffect(() => {
        if (open) {
            fetchUnits();
        }
    }, [open]);

    const fetchUnits = async () => {
        try {
            setLoadingUnits(true);
            const res = await materialService.getAllUnit();
            setUnits(res);
        } catch (error) {
            message.error("Failed to load units!");
        } finally {
            setLoadingUnits(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await materialService.create(values);
            message.success("Material created successfully!");
            onSuccess(res);
            form.resetFields();
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
            title="Create Material"
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
                    label="Material Name"
                    rules={[{ required: true, message: "Please input material name!" }]}
                >
                    <Input placeholder="Enter material name" />
                </Form.Item>

                <Form.Item
                    name="code"
                    label="Material Code"
                    rules={[{ required: true, message: "Please input material code!" }]}
                >
                    <Input placeholder="Enter material code" />
                </Form.Item>

                <Form.Item
                    name="unitId"
                    label="Unit"
                    rules={[{ required: true, message: "Please select a unit!" }]}
                >
                    {loadingUnits ? (
                        <Spin />
                    ) : (
                        <Select
                            placeholder="Select unit"
                            options={units.map((u) => ({
                                label: `${u.name} (${u.symbol})`,
                                value: u.id,
                            }))}
                            showSearch
                            optionFilterProp="label"
                        />
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
}
