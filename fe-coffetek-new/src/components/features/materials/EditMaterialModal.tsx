"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Spin } from "antd";
import { materialService } from "@/services/materialService";
import type { Material, Unit } from "@/interfaces";

interface EditMaterialModalProps {
    open: boolean;
    onClose: () => void;
    materialId?: number | null;
    onSuccess: (updatedMaterial: Material) => void;
}

export function EditMaterialModal({
    open,
    onClose,
    materialId,
    onSuccess,
}: EditMaterialModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingMaterial, setLoadingMaterial] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);

    // 🧩 Load danh sách unit
    useEffect(() => {
        (async () => {
            try {
                const res = await materialService.getAllUnit();
                setUnits(res);
            } catch (err) {
                message.error("Failed to load units");
            }
        })();
    }, []);

    // 🧩 Khi mở modal hoặc id thay đổi → load material
    useEffect(() => {
        if (open && materialId) {
            setLoadingMaterial(true);
            materialService
                .getById(materialId)
                .then((res) => {
                    form.setFieldsValue({
                        name: res.name,
                        unitId: res.unit?.id,
                        code: res.code,
                    });
                })
                .catch(() => message.error("Failed to load material"))
                .finally(() => setLoadingMaterial(false));
        } else {
            form.resetFields();
        }
    }, [open, materialId, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!materialId) return;

            setLoading(true);
            const res = await materialService.update(materialId, values);

            message.success("Material updated successfully!");
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
            title="Edit Material"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
            destroyOnClose
        >
            {loadingMaterial ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin />
                </div>
            ) : (
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
                        <Select placeholder="Select unit">
                            {units.map((u) => (
                                <Select.Option key={u.id} value={u.id}>
                                    {u.name} ({u.symbol})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
}
