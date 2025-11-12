'use client';
import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import type { Category } from "@/interfaces";
import { categoryService } from "@/services/categoryService";

interface EditCategoryModalProps {
    open: boolean;
    onClose: () => void;
    record?: Category | null;
    onSuccess: () => void;
}

export function EditCategoryModal({ open, onClose, record, onSuccess }: EditCategoryModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [isParent, setIsParent] = useState<boolean>(true);

    useEffect(() => {
        if (open && record) {
            setLoading(true);
            categoryService
                .getAll({ size: 9999, isParentCategory: true })
                .then((res) => {
                    const parents = res.data;
                    setParentCategories(parents);
                    setIsParent(record.is_parent_category);
                    form.setFieldsValue(record);
                })
                .finally(() => setLoading(false));
        }
    }, [open, record, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;
            setLoading(true);

            const payload = {
                name: values.name,
                // chỉ gửi parent_category_id nếu là category con
                is_parent_category: record.is_parent_category,
                parent_category_id: isParent ? null : values.parent_category_id,
            };

            await categoryService.update(record.id, payload);
            message.success("Category updated successfully!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 400) {
                message.error(err.response.data?.message || "Invalid input!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Category"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                }
            }}
        >
            <Form form={form} layout="vertical">
                {/* Luôn cho sửa tên */}
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter the category name!" }]}
                >
                    <Input placeholder="Enter category name" />
                </Form.Item>

                {/* Nếu là category con thì cho sửa parent */}
                {!isParent && (
                    <Form.Item
                        name="parent_category_id"
                        label="Parent Category"
                        rules={[
                            { required: true, message: "Please select a parent category!" },
                        ]}
                    >
                        <Select
                            placeholder="Select parent category"
                            options={parentCategories
                                .filter((cat) => cat.id !== record?.id)
                                .map((cat) => ({
                                    value: cat.id,
                                    label: cat.name,
                                }))}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}
