// EditRecipe.tsx
"use client";

import { useEffect, useState } from "react";
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
    CheckOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import type { Material } from "@/interfaces";
import { MaterialListSelector, MaterialSearchSelector } from "../materials";
import { mapRecipeItemsToDto, recipeService, type RecipeByProductId } from "@/services";
import { ProductInfo } from "@/app/admin/products/create/page";
import { ColumnsType } from "antd/es/table";

interface RecipeItem {
    material: Material;
    consume: {
        sizeId: number | null;
        amount: number;
    }[];
}

interface EditRecipeProps {
    productInfo: ProductInfo;
    onRecipeUpdated: () => void;
}

const { Title, Text } = Typography;

export function EditRecipe({
    productInfo,
    onRecipeUpdated,
}: EditRecipeProps) {
    const { token } = theme.useToken();
    const [consumeForm] = Form.useForm();
    const [openMaterialListSelector, setOpenMaterialListSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
    const [editModal, setEditModal] = useState<{
        open: boolean;
        index: number | null;
    }>({ open: false, index: null });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [recipe, setRecipe] = useState<RecipeItem[]>([]);
    const [recipeData, setRecipeData] = useState<RecipeByProductId | null>(null);

    const isMultiSize = productInfo.type === "multi_size";
    const sizes = isMultiSize ? productInfo.sizes || [] : [{ id: null, name: "Default" }];

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await recipeService.getByProductId(productInfo.productId);
                setRecipeData(res);
                const materialMap = new Map<number, RecipeItem>();
                res.MaterialRecipe.forEach((mr) => {
                    const mid = mr.materialId;
                    if (!materialMap.has(mid)) {
                        materialMap.set(mid, {
                            material: {
                                id: mr.Material.id,
                                name: mr.Material.name,
                                remain: mr.Material.remain,
                                code: mr.Material.code,
                                unit: mr.Material.Unit,
                                Unit: mr.Material.Unit,
                            },
                            consume: [],
                        });
                    }
                    const item = materialMap.get(mid)!;
                    item.consume.push({ sizeId: mr.sizeId, amount: mr.consume });
                });
                setRecipe(Array.from(materialMap.values()));
            } catch {
                setRecipeData(null);
                setRecipe([]);
            }
        };
        fetchRecipe();
    }, [productInfo.productId]);

    const handleSelectFromSearch = (material: Material | null) => {
        if (!material) return;

        setRecipe((prev) => {
            const isDuplicate = prev.some(
                (r) => r.material.id === material.id || r.material.code === material.code
            );
            if (isDuplicate) {
                message.warning("This material is already added");
                return prev;
            }

            const initialConsume = sizes.map((size) => ({
                sizeId: size.id,
                amount: 0,
            }));

            const updated = [...prev, { material, consume: initialConsume }];
            return updated;
        });
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
            setErrorMessage("Please add at least one material consume before complete.");
            return;
        }

        const invalidIndexesFound = recipe
            .map((item, i) => (isRowValid(item) ? -1 : i))
            .filter((i) => i !== -1);

        if (invalidIndexesFound.length > 0) {
            setInvalidIndexes(invalidIndexesFound);
            setErrorMessage("Each usage value must be greater than 0.");
            return;
        }

        setInvalidIndexes([]);
        setErrorMessage(null);
        setLoading(true);

        try {
            if (isMultiSize) {
                const sizes = productInfo.sizes!;
                if (sizes.length === 0) {
                    message.error("No sizes found for multi-size product.");
                    return;
                }

                if (recipeData) {
                    // ✅ Đã có recipe → Update cho từng size
                    await Promise.all(
                        sizes.map((size) => {
                            const dto = mapRecipeItemsToDto(
                                productInfo.productId.toString(),
                                size.id,
                                recipe
                            );
                            return recipeService.update(recipeData.id, dto);
                        })
                    );
                    message.success("Recipe updated successfully for all sizes.");
                } else {
                    // ✅ Chưa có recipe → Tạo mới cho từng size
                    const firstSize = sizes[0];
                    const dto = mapRecipeItemsToDto(
                        productInfo.productId.toString(),
                        firstSize.id,
                        recipe
                    );
                    const created = await recipeService.create(dto);


                    await Promise.all(
                        sizes.map((size) => {
                            const dtoUpdate = mapRecipeItemsToDto(
                                productInfo.productId.toString(),
                                size.id,
                                recipe
                            );
                            return recipeService.update(created.id, dtoUpdate);
                        })
                    );

                    message.success("Recipe created successfully for all sizes.");
                }
            } else {
                // ✅ Single size
                if (recipeData) {
                    // Đã có → update
                    const dto = mapRecipeItemsToDto(
                        productInfo.productId.toString(),
                        null,
                        recipe
                    );
                    await recipeService.update(recipeData.id, dto);
                    message.success("Recipe updated successfully.");
                } else {
                    // Chưa có → tạo mới
                    const dto = mapRecipeItemsToDto(
                        productInfo.productId.toString(),
                        null,
                        recipe
                    );
                    await recipeService.create(dto);
                    message.success("Recipe created successfully.");
                }
            }

            onRecipeUpdated();
        } catch (err) {
            console.error("Error while saving recipe:", err);
            message.error("Something went wrong while saving the recipe.");
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

    const columns: ColumnsType<RecipeItem> = [
        {
            title: "Used materials",
            key: "material",
            fixed: "left",
            render: (item: RecipeItem) => (
                <Text strong>
                    {item.material.name} ({item.material.unit?.symbol || ""})
                </Text>
            ),
        },
        ...(isMultiSize
            ? [
                {
                    title: "Usage per Size",
                    children: productInfo.sizes!.map((size) => ({
                        title: size.name,
                        key: `consume_${size.id}`,
                        align: "center" as const,
                        render: (item: RecipeItem) => {
                            const consumeEntry = item.consume.find(c => c.sizeId === size.id);
                            const amount = consumeEntry?.amount || 0;
                            return (
                                <Text type={amount <= 0 ? "danger" : undefined}>
                                    {amount}
                                </Text>
                            );
                        },
                    })),
                },
            ]
            : [
                {
                    title: "Consume",
                    key: "consume",
                    align: "center" as const,
                    render: (item: RecipeItem) => {
                        const amount = item.consume[0]?.amount || 0;
                        return (
                            <Text type={amount <= 0 ? "danger" : undefined}>
                                {amount}
                            </Text>
                        );
                    },
                },
            ]),
        {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: "right",
            width: 60,
            render: (_: any, item: RecipeItem, index: number) => (
                <Space>
                    <Tooltip title="Edit usage">
                        <Button
                            icon={<EditOutlined style={{ color: token.colorPrimary }} />}
                            onClick={() => handleEditConsume(index)}
                        />
                    </Tooltip>
                    <Tooltip title="Remove used materials">
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
                <Tooltip title="Browse materials">
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
            {recipe.length === 0 && (
                <Text type="secondary" style={{ marginBottom: token.marginSM }}>
                    Select and define at least one material and consume to create the recipe
                </Text>
            )}

            {recipe.length > 0 && (
                <>
                    <Title level={5} style={{ marginBottom: token.marginSM }}>
                        Material Consumed
                    </Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: token.marginSM }}>
                        Define how much of each material is used for every product size.
                    </Text>
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
                        scroll={recipe && recipe.length > 0 ? { x: "max-content" } : undefined}
                    />
                </>
            )}

            <Divider />

            <Flex wrap justify="space-between" align="flex-end" style={{ marginTop: 32 }}>
                <div>
                    {errorMessage && (
                        <Text type="danger" style={{ marginTop: 8 }}>
                            {errorMessage}
                        </Text>
                    )}
                </div>
                <Space>
                    <Button icon={<CheckOutlined />} type="primary" onClick={handleSubmit} loading={loading}>
                        Update
                    </Button>
                </Space>
            </Flex>

            <Modal
                open={editModal.open}
                title="Adjust Material Usage"
                okText="Save Changes"
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
                                        isMultiSize ? (
                                            <span>
                                                Consume for <Text strong>{productInfo.sizes![idx].name}</Text>
                                            </span>
                                        ) : (
                                            "Usage"
                                        )
                                    }
                                    name={[field.name, "amount"]}
                                    rules={[
                                        { required: true, message: "Please enter a usage value" },
                                        {
                                            validator: (_, value) =>
                                                value > 0
                                                    ? Promise.resolve()
                                                    : Promise.reject("Please enter a value greater than 0"),
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
                .ant-table-row-invalid:hover td {
                    background: ${token.colorErrorBg} !important;
                }
            `}</style>
        </>
    );
}