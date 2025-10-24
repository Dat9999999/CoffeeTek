"use client";

import { useState } from "react";
import {
    Modal,
    message,
    Button,
    Typography,
    Space,
    InputNumber,
    Tooltip,
    theme,
    Flex,
    Form,
    Table,
    Divider,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    AppstoreAddOutlined,
    ArrowLeftOutlined,
    CheckOutlined,
    StepForwardOutlined,
    FastForwardOutlined,
} from "@ant-design/icons";
import type { Material } from "@/interfaces";
import { MaterialListSelector, MaterialSearchSelector } from "../materials";
import { mapRecipeItemsToDto, recipeService } from "@/services";
import { ProductInfo } from "@/app/admin/products/create/page";

interface CreateRecipeProps {
    productInfo: ProductInfo;
    onRecipeCreated: () => void;
    onCancel: () => void;
}

interface RecipeItem {
    material: Material;
    consume: {
        sizeId: number | null;
        amount: number;
    }[];
}

const { Title, Text } = Typography;

export function CreateRecipe({
    productInfo,
    onRecipeCreated,
    onCancel,
}: CreateRecipeProps) {
    const { token } = theme.useToken();
    const [consumeForm] = Form.useForm();
    const [openMaterialListSelector, setOpenMaterialListSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
    const [editModal, setEditModal] = useState<{
        open: boolean;
        index: number | null;
    }>({ open: false, index: null });

    const [recipe, setRecipe] = useState<RecipeItem[]>([]);

    const isMultiSize = productInfo.type === "multi_size";
    const sizes = isMultiSize ? productInfo.sizes || [] : [{ id: null, name: "Default" }];

    const handleSelectFromSearch = (material: Material | null) => {
        if (!material) return;
        if (recipe.some((r) => r.material.id === material.id)) {
            message.warning("Material already selected");
            return;
        }
        const initialConsume = sizes.map((size) => ({ sizeId: size.id, amount: 0 }));
        setRecipe((prev) => [...prev, { material, consume: initialConsume }]);
    };

    const handleDelete = (id: number) => {
        setInvalidIndexes((prev) => prev.filter((idx) => recipe.findIndex((r) => r.material.id === id) !== idx));
        setRecipe((prev) => prev.filter((r) => r.material.id !== id));
    };

    const isRowValid = (item: RecipeItem) => {
        return item.consume.length === sizes.length && item.consume.every((c) => c.amount > 0);
    };

    const handleSubmit = async () => {
        if (recipe.length === 0) {
            message.error("Please select at least one material");
            return;
        }

        const invalidIndexesFound = recipe
            .map((item, i) => (isRowValid(item) ? -1 : i))
            .filter((i) => i !== -1);

        if (invalidIndexesFound.length > 0) {
            setInvalidIndexes(invalidIndexesFound);
            message.warning("Consume must be greater than 0 for all fields in each row");
            return;
        }

        setInvalidIndexes([]);

        const payload = {
            productId: productInfo.productId,
            materials: recipe.flatMap((r) =>
                r.consume.map((c) => ({
                    materialId: r.material.id,
                    sizeId: c.sizeId,
                    amount: c.amount,
                }))
            ),
        };

        setLoading(true);
        try {
            console.log("Submitting recipe payload:", payload);
            if (isMultiSize) {
                await Promise.all(
                    productInfo.sizes!.map(size => {
                        const dto = mapRecipeItemsToDto(productInfo.productId.toString(), size.id, recipe);
                        return recipeService.create(dto);
                    })
                );
            } else {
                const dto = mapRecipeItemsToDto(productInfo.productId.toString(), null, recipe);
                await recipeService.create(dto);
            }

            onRecipeCreated();
        } catch (err) {
            message.error("Failed to create recipe");
        } finally {
            setLoading(false);
        }
    };

    const handleEditConsume = (index: number) => {
        const item = recipe[index];
        const initialValues = {
            consumes: item.consume.map((c) => ({ amount: c.amount })),
        };
        consumeForm.setFieldsValue(initialValues);
        setEditModal({ open: true, index });
    };

    const handleSaveConsume = (values: any) => {
        if (editModal.index === null) return;
        const newConsume = values.consumes.map((v: { amount: number }, i: number) => ({
            sizeId: sizes[i].id,
            amount: v.amount,
        }));
        setRecipe((prev) =>
            prev.map((r, i) =>
                i === editModal.index ? { ...r, consume: newConsume } : r
            )
        );
        const currentItem = recipe[editModal.index];
        if (currentItem && isRowValid({ material: currentItem.material, consume: newConsume })) {
            setInvalidIndexes((prev) => prev.filter((i) => i !== editModal.index));
        }
        setEditModal({ open: false, index: null });
    };

    const columns = [
        {
            title: "Material",
            key: "material",
            render: (item: RecipeItem) => (
                <Text strong>
                    {item.material.name} ({item.material.unit?.symbol || ""})
                </Text>
            ),
        },
        ...(isMultiSize
            ? productInfo.sizes!.map((size) => ({
                title: `Consume (${size.name})`,
                key: `consume_${size.id}`,
                render: (item: RecipeItem) => {
                    const amount = item.consume.find((c) => c.sizeId === size.id)?.amount || 0;
                    return <Text>{amount}</Text>;
                },
            }))
            : [
                {
                    title: "Consume",
                    key: "consume",
                    render: (item: RecipeItem) => {
                        const amount = item.consume[0]?.amount || 0;
                        return <Text>{amount}</Text>;
                    },
                },
            ]),
        {
            title: "Actions",
            key: "actions",
            with: 120,
            render: (_: any, item: RecipeItem, index: number) => (
                <Space>
                    <Tooltip title="Edit consume">
                        <Button icon={<EditOutlined style={{ color: token.colorPrimary }} />} onClick={() => handleEditConsume(index)} />
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
            ),
        },
    ];

    return (
        <>
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

            {recipe.length > 0 && (
                <>
                    <Title level={5} style={{ marginBottom: token.marginSM }}>
                        Selected Materials
                    </Title>
                    <Table
                        bordered
                        dataSource={recipe}
                        columns={columns}
                        pagination={false}
                        rowKey={(item) => item.material.id}
                        rowClassName={(record, index) =>
                            invalidIndexes.includes(index)
                                ? "ant-table-row-invalid"
                                : ""
                        }
                        style={{ marginBottom: 32 }}
                    />
                </>
            )}

            <Divider />
            <Flex justify="flex-end" style={{ marginTop: 32 }}>
                <Space>
                    <Button iconPosition="end" icon={<FastForwardOutlined />} onClick={onCancel}>
                        Skip
                    </Button>
                    <Button icon={<CheckOutlined />} type="primary" onClick={handleSubmit} loading={loading}>
                        Complete
                    </Button>
                </Space>
            </Flex>

            <Modal
                open={editModal.open}
                title="Edit Consume"
                okText="Save"
                onOk={() => consumeForm.submit()}
                onCancel={() => {
                    consumeForm.resetFields();
                    setEditModal({ open: false, index: null });
                }}
                destroyOnClose
            >
                <Form
                    form={consumeForm}
                    layout="vertical"
                    onFinish={handleSaveConsume}
                >
                    <Form.List name="consumes">
                        {(fields) =>
                            fields.map((field, idx) => (
                                <Form.Item
                                    {...field}
                                    key={field.key}
                                    label={
                                        isMultiSize
                                            ? `Consume for ${productInfo.sizes![idx].name}`
                                            : "Consume"
                                    }
                                    name={[field.name, "amount"]}
                                    rules={[
                                        { required: true, message: "Please enter consume" },
                                        {
                                            validator: (_, value) =>
                                                value > 0
                                                    ? Promise.resolve()
                                                    : Promise.reject("Consume must be greater than 0"),
                                        },
                                    ]}
                                >
                                    <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
                                </Form.Item>
                            ))
                        }
                    </Form.List>
                </Form>
            </Modal>

            <MaterialListSelector
                materialListCurrent={recipe.map((r) => r.material)}
                open={openMaterialListSelector}
                onSuccess={(selected) => {
                    const newItems = selected.filter(
                        (m: Material) => !recipe.some((r) => r.material.id === m.id)
                    );
                    const initialConsume = sizes.map((size) => ({ sizeId: size.id, amount: 0 }));
                    setRecipe((prev) => [
                        ...prev,
                        ...newItems.map((m) => ({ material: m, consume: initialConsume })),
                    ]);
                    setOpenMaterialListSelector(false);
                }}
                onClose={() => setOpenMaterialListSelector(false)}
            />

            <style jsx global>{`
                .ant-table-row-invalid td {
                    border-top: 1px solid ${token.colorErrorBorder} !important;
                    border-bottom: 1px solid ${token.colorErrorBorder} !important;
                }
                .ant-table-row-invalid:hover td {
                    background: ${token.colorErrorBg} !important;
                }
            `}</style>
        </>
    );
}