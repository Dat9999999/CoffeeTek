"use client";

import { useEffect, useState } from "react";
import {
    Modal,
    message,
    Button,
    Typography,
    List,
    Space,
    InputNumber,
    Tooltip,
    theme,
    Flex,
    Form,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    AppstoreAddOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import type { Material } from "@/interfaces";
import { MaterialListSelector, MaterialSearchSelector } from "../materials";
import { recipeService } from "@/services";

interface CreateRecipeProps {
    productId: number;
    onRecipeCreated: () => void;
    onCancel: () => void;
}

const { Title, Text } = Typography;

export function CreateRecipe({ productId, onRecipeCreated, onCancel }: CreateRecipeProps) {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [consumeForm] = Form.useForm();
    const [openMaterialListSelector, setOpenMaterialListSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
    // modal chỉnh consume
    const [editModal, setEditModal] = useState<{
        open: boolean;
        index: number | null;
        value: number;
    }>({ open: false, index: null, value: 0 });

    // lưu tạm danh sách materials
    const [recipe, setRecipe] = useState<
        { material: Material; consume: number }[]
    >([]);

    /** đồng bộ state recipe -> form materials */
    useEffect(() => {
        form.setFieldsValue({
            materials: recipe.map((r) => ({
                materialId: r.material.id,
                name: r.material.name,
                unit: r.material.unit?.symbol,
                consume: r.consume,
            })),
        });
    }, [recipe, form]);

    /** Chọn từ search */
    const handleSelectFromSearch = (material: Material | null) => {
        if (!material) return;
        setRecipe((prev) => {
            if (prev.some((m) => m.material.id === material.id)) {
                message.warning("Material already selected");
                return prev;
            }
            return [...prev, { material, consume: 0 }];
        });
    };

    /** Xóa material */
    const handleDelete = (id: number) => {
        setInvalidIndexes((prev) =>
            prev.filter((idx) => recipe.findIndex((r) => r.material.id === id) !== idx)
        );
        setRecipe((prev) => prev.filter((r) => r.material.id !== id));

    };

    /** Submit form */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log(">>> values", values)

            if (!values.materials || values.materials.length === 0) {
                message.error("Please select at least one material");
                return;
            }

            const invalidIndexesFound = values.materials
                .map((m: any, i: number) => (Number(m.consume) <= 0 ? i : -1))
                .filter((i: number) => i !== -1);

            if (invalidIndexesFound.length > 0) {
                setInvalidIndexes(invalidIndexesFound); // ⚡ Cập nhật để rerender tô đỏ
                message.warning("Consume must be greater than 0 for all materials");
                return;
            }

            // clear invalid highlight
            setInvalidIndexes([]);

            const payload = {
                productId,
                materials: values.materials.map((m: any) => ({
                    materialId: m.materialId,
                    consume: Number(m.consume),
                })),
            };

            setLoading(true);
            await recipeService.create(payload);
            onRecipeCreated();
        } catch (err: any) {
            if (err.errorFields) {
                message.warning("Please fix the highlighted errors");
            } else {
                message.error("Failed to create recipe");
            }
        } finally {
            setLoading(false);
        }
    };

    /** Mở modal chỉnh consume */
    const handleEditConsume = (index: number, value: number) => {
        setEditModal({ open: true, index, value });
    };

    /** Lưu consume từ modal */
    const handleSaveConsume = () => {
        if (editModal.index === null) return;
        setRecipe((prev) =>
            prev.map((r, i) =>
                i === editModal.index ? { ...r, consume: editModal.value } : r
            )
        );
        form.setFieldValue(["materials", editModal.index, "consume"], editModal.value);
        if (editModal.value > 0) setInvalidIndexes((prev) => prev.filter((i) => i !== editModal.index));
        setEditModal({ open: false, index: null, value: 0 });
    };

    return (
        <>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Flex wrap gap={token.marginSM} align="center" style={{ marginBottom: token.marginMD }}>
                    <Tooltip title="Open advanced material selector">
                        <Button
                            type="primary"
                            icon={<AppstoreAddOutlined />}
                            onClick={() => setOpenMaterialListSelector(true)}
                            style={{
                                height: 40,
                                width: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        />
                    </Tooltip>

                    <div style={{ flex: 1 }}>
                        <MaterialSearchSelector
                            onSelect={handleSelectFromSearch}
                            style={{ width: "100%", height: 40 }}
                        />
                    </div>
                </Flex>

                {/* Hiển thị materials đã chọn */}
                {recipe.length > 0 && (
                    <>
                        <Title level={5} style={{ marginBottom: token.marginSM }}>
                            Selected Materials
                        </Title>

                        <Form.List name="materials">
                            {() => (
                                <List
                                    dataSource={recipe}
                                    renderItem={(item, index) => (
                                        <List.Item
                                            style={{
                                                background: token.colorBgContainer,
                                                borderRadius: 10,
                                                border: `1px solid ${invalidIndexes.includes(index)
                                                    ? token.colorErrorBorder
                                                    : token.colorBorderSecondary
                                                    }`,
                                                marginBottom: 10,
                                                padding: "12px 16px",
                                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                            }}
                                        >
                                            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                                                <Flex align="center">
                                                    <Space direction="vertical" size={2}>
                                                        <Text strong>
                                                            {item.material.name} ({item.material.unit?.symbol || ""})
                                                        </Text>
                                                        <Text type="secondary">
                                                            Consume:{" "}
                                                            <span
                                                                style={{
                                                                    color: invalidIndexes.includes(index)
                                                                        ? token.colorErrorText
                                                                        : "inherit",
                                                                    fontWeight: invalidIndexes.includes(index) ? 600 : 400,
                                                                }}
                                                            >
                                                                {item.consume || 0}
                                                            </span>
                                                        </Text>
                                                    </Space>
                                                </Flex>

                                                <Space>
                                                    <Tooltip title="Edit consume">
                                                        <Button
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEditConsume(index, item.consume)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Remove material">
                                                        <Button
                                                            size="small"
                                                            danger
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDelete(item.material.id)}
                                                        />
                                                    </Tooltip>
                                                </Space>
                                            </Flex>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Form.List>

                    </>
                )}

                <Flex justify="flex-end" style={{ marginTop: 32 }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={onCancel}>
                            Skip
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Complete
                        </Button>
                    </Space>
                </Flex>
            </Form>

            {/* Modal chỉnh consume */}
            <Modal
                open={editModal.open}
                title="Edit Consume"
                okText="Save"
                onOk={() => consumeForm.submit()} // submit riêng modal form
                onCancel={() => {
                    consumeForm.resetFields();
                    setEditModal({ open: false, index: -1, value: 0 });
                }}
                destroyOnClose
            >
                <Form
                    form={consumeForm}
                    layout="vertical"
                    onFinish={(values) => {
                        if (editModal.index === null) return;
                        const newValue = values.consume;

                        setRecipe((prev) =>
                            prev.map((r, i) =>
                                i === editModal.index ? { ...r, consume: newValue } : r
                            )
                        );

                        // Cập nhật field vào form chính
                        form.setFieldValue(["materials", editModal.index, "consume"], newValue);
                        if (newValue > 0)
                            setInvalidIndexes((prev) => prev.filter((i) => i !== editModal.index));

                        consumeForm.resetFields();
                        setEditModal({ open: false, index: null, value: 0 });
                    }}
                    initialValues={{ consume: editModal.value }}
                >
                    <Form.Item
                        label="Consume"
                        name="consume"
                        rules={[
                            { required: true, message: "Please enter consume" },
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null || value <= 0)
                                        return Promise.reject("Consume must be greater than 0");
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>



            {/* Modal chọn nhiều material */}
            <MaterialListSelector
                materialListCurrent={recipe.map((r) => r.material)}
                open={openMaterialListSelector}
                onSuccess={(selected) => {
                    const newItems = selected.filter(
                        (m: Material) => !recipe.some((r) => r.material.id === m.id)
                    );
                    setRecipe((prev) => [
                        ...prev,
                        ...newItems.map((m) => ({ material: m, consume: 0 })),
                    ]);
                    setOpenMaterialListSelector(false);
                }}
                onClose={() => setOpenMaterialListSelector(false)}
            />
        </>
    );
}
