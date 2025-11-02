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
    Spin,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    AppstoreAddOutlined,
    CheckOutlined,
    CloseOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import type { Material, ProductDetail, ProductSize, Size } from "@/interfaces";
import { mapRecipeItemsToDto, recipeService, type RecipeByProductId } from "@/services/recipeService";
import { productService } from "@/services/productService";
import { ColumnsType } from "antd/es/table";
import { MaterialListSelector, MaterialSearchSelector } from "@/components/features/materials";
import { useParams, useRouter } from "next/navigation";

interface RecipeItem {
    material: Material;
    consume: {
        sizeId: number | null;
        amount: number;
    }[];
}

const { Title, Text } = Typography;

export default function UpdateRecipePage() {
    const router = useRouter();
    const { token } = theme.useToken();
    const [consumeForm] = Form.useForm();
    const [openMaterialListSelector, setOpenMaterialListSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
    const [editModal, setEditModal] = useState<{
        open: boolean;
        index: number | null;
    }>({ open: false, index: null });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [recipe, setRecipe] = useState<RecipeItem[]>([]);
    const [recipeData, setRecipeData] = useState<RecipeByProductId | null>(null);
    const [product, setProduct] = useState<ProductDetail | null>(null);

    const params = useParams();
    const productId = Number(params.id);

    const isMultiSize = product?.is_multi_size ?? false;
    const sizes = isMultiSize
        ? (product?.sizes ?? []).map((s) => ({ id: s.size.id, name: s.size.name }))
        : [{ id: null, name: "Default" }];

    useEffect(() => {
        const fetchData = async () => {
            if (!productId) return;
            setFetching(true);
            try {
                const [productRes, recipeRes] = await Promise.all([
                    productService.getById(productId),
                    recipeService.getByProductId(productId).catch(() => null), // Handle case where no recipe exists
                ]);
                setProduct(productRes);
                setRecipeData(recipeRes);

                if (recipeRes && Array.isArray(recipeRes.MaterialRecipe) && recipeRes.MaterialRecipe.length > 0) {
                    const materialMap = new Map<number, RecipeItem>();
                    const isMultiSize = productRes?.is_multi_size ?? false;
                    const sizes = isMultiSize
                        ? (productRes?.sizes ?? []).map((s: ProductSize) => s.size)
                        : [{ id: null, name: "Default" }];

                    recipeRes.MaterialRecipe.forEach((mr) => {
                        if (!mr.Material || typeof mr.materialId !== "number" || typeof mr.consume !== "number") {
                            console.warn(`Invalid MaterialRecipeItem: ${JSON.stringify(mr)}`);
                            return;
                        }

                        const mid = mr.materialId;
                        if (!materialMap.has(mid)) {
                            materialMap.set(mid, {
                                material: {
                                    id: mr.Material.id,
                                    name: mr.Material.name || "",
                                    code: mr.Material.code || "",
                                    remain: mr.Material.remain || 0,
                                    unit: mr.Material.Unit || { id: 0, name: "", symbol: "", class: "" },
                                },
                                consume: [],
                            });
                        }
                        const item = materialMap.get(mid)!;
                        item.consume.push({ sizeId: mr.sizeId, amount: mr.consume });
                    });

                    const recipeItems = Array.from(materialMap.values()).map((item) => {
                        const consumeMap = new Map(item.consume.map((c) => [c.sizeId, c.amount]));
                        const completeConsume = sizes.map((size: Size) => ({
                            sizeId: size.id,
                            amount: consumeMap.get(size.id) ?? 0,
                        }));
                        return { ...item, consume: completeConsume };
                    });

                    setRecipe(recipeItems);
                } else {
                    // Explicitly set empty recipe when no recipe exists
                    setRecipe([]);
                    setRecipeData(null);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
                message.error("Failed to load product or recipe details.");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [productId]);

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

            return [...prev, { material, consume: initialConsume }];
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
        if (!product) {
            message.error("Product data not loaded.");
            return;
        }

        if (recipe.length === 0) {
            setErrorMessage("Please add at least one material consume before update.");
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
                if (!recipeData) {
                    //  Chưa có recipe, tạo mới cho size đầu tiên
                    const firstSize = sizes[0];
                    const dto = mapRecipeItemsToDto(product.id.toString(), firstSize.id, recipe);
                    const created = await recipeService.create(dto);

                    //  Sau đó update 
                    await Promise.all(
                        sizes.map(size => {
                            const dto = mapRecipeItemsToDto(product.id.toString(), size.id, recipe);
                            return recipeService.update(created.id, dto);
                        })
                    );
                } else {
                    //  Nếu đã có recipe rồi thì update toàn bộ các size
                    await Promise.all(
                        sizes.map(size => {
                            const dto = mapRecipeItemsToDto(product.id.toString(), size.id, recipe);
                            return recipeService.update(recipeData.id, dto);
                        })
                    );
                }
            } else {
                //  Single size
                const dto = mapRecipeItemsToDto(product.id.toString(), null, recipe);
                if (recipeData) {
                    await recipeService.update(recipeData.id, dto);
                } else {
                    await recipeService.create(dto);
                }
            }


            message.success("Recipe saved successfully.");
            // Optionally, refresh recipe data after creation
            const updatedRecipe = await recipeService.getByProductId(productId).catch(() => null);
            setRecipeData(updatedRecipe);
        } catch (err) {
            console.error("Recipe operation failed:", err);
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
                    children: sizes.map((size) => ({
                        title: size.name,
                        key: `consume_${size.id}`,
                        align: "center" as const,
                        render: (item: RecipeItem) => {
                            const consumeEntry = item.consume.find((c) => c.sizeId === size.id);
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

    if (fetching) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBlock: token.paddingXL,
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    const handleBackToProducts = () => {
        router.push("/admin/products");
    };

    return (
        <>
            <Flex align="center" style={{ marginBottom: 24 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={handleBackToProducts}
                    style={{ marginRight: 12, padding: 0 }}
                />
                <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center" }}>
                    {product ? `Recipe for ${product.name}` : "Edit Recipe"}
                </Title>
            </Flex>

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
                    No recipe exists for this product. Select and define at least one material and its consumption to create a recipe.
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
                            invalidIndexes.includes(index) ? "ant-table-row-invalid" : ""
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
                        Save
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
                <Form form={consumeForm} layout="vertical" onFinish={handleSaveConsume}>
                    <Form.List name="consumes">
                        {(fields) =>
                            fields.map((field, idx) => (
                                <Form.Item
                                    {...field}
                                    key={field.key}
                                    label={
                                        isMultiSize ? (
                                            <span>
                                                Consume for <Text strong>{sizes[idx].name}</Text>
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