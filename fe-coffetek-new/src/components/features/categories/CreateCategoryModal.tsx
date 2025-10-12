'use client';
import { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Select, message } from "antd";
import type { Category } from "@/interfaces";
import { categoryService } from "@/services/categoryService";

interface CreateCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateCategoryModal({ open, onClose, onSuccess }: CreateCategoryModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [isParent, setIsParent] = useState(true);

    useEffect(() => {
        const fetchParentCategories: any = async () => {
            if (!open) return;
            setLoading(true);
            try {
                const res = await categoryService.getAll({ size: 9999, isParentCategory: true });
                const parents = res.data;
                setParentCategories(parents);
            } catch (error) {
                message.error("Failed to fetch parent categories");
            } finally {
                setLoading(false);
            }
        };
        fetchParentCategories();
    }, [open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = {
                ...values,
                parent_category_id: isParent ? null : values.parent_category_id,
            };
            const res = await categoryService.create(payload);
            message.success("Category created successfully!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 400) {
                message.error(err.response.data?.message || "Invalid input!");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Category"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setIsParent(true);
                }
            }}
        >
            <Form form={form} layout="vertical" initialValues={{ is_parent_category: true }}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter the category name!" }]}
                >
                    <Input placeholder="Enter category name" />
                </Form.Item>
                <Form.Item
                    name="is_parent_category"
                    label="Is Parent Category?"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Parent"
                        unCheckedChildren="Sub"
                        onChange={(checked) => {
                            setIsParent(checked);
                            if (checked) {
                                form.setFieldsValue({ parent_category_id: null });
                            }
                        }}
                    />
                </Form.Item>
                {!isParent && (
                    <Form.Item
                        name="parent_category_id"
                        label="Parent Category"
                        dependencies={["is_parent_category"]}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!getFieldValue("is_parent_category") && !value) {
                                        return Promise.reject(new Error("Please select a parent category!"));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Select
                            placeholder="Select parent category"
                            options={parentCategories.map((cat) => ({
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