"use client";

import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    InputNumber,
    message,
    Button,
    Select,
    Spin,
    Space,
    Flex,
    Row,
    Col,
    Typography,
    theme,
    Segmented,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import type {
    CreateProductDto,
    ProductImageInput,
    Size,
    Topping,
    OptionGroup,
} from "@/interfaces";
import {
    sizeService,
    productService,
    toppingService,
} from "@/services";
import { OnlyNewImageUploader } from "@/components/features/products";
import { formatPrice, parsePrice, restrictInputToNumbers } from "@/utils/priceFormatter";
import { ToppingSelectorModal } from "@/components/features/toppings";
import { CategorySelector } from "@/components/features/categories/CategorySelector";
import { OptionGroupSelector } from "@/components/features/option-groups/OptionGroupSelector";
import { uploadImages } from "@/services";
import { useRouter } from "next/navigation";
import { ProductInfo } from "@/app/admin/products/create/page";
import { is } from "date-fns/locale";

const { Title } = Typography;

interface CreateProductInfoProps {
    onProductCreated: (productInfo: ProductInfo) => void;
    onCancel: () => void;
}

export function CreateProductInfo({ onProductCreated, onCancel }: CreateProductInfoProps) {
    const router = useRouter();
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [productType, setProductType] = useState<'no_size' | 'multi_size' | 'topping'>('no_size');

    const [sizes, setSizes] = useState<Size[]>([]);
    const [loadingSizes, setLoadingSizes] = useState(false);
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const [selectedOptionGroups, setSelectedOptionGroups] = useState<OptionGroup[]>([]);
    const [toppingModalOpen, setToppingModalOpen] = useState(false);
    const [optionGroupModalOpen, setOptionGroupModalOpen] = useState(false);

    useEffect(() => {
        loadSizes();
    }, []);

    const loadSizes = async () => {
        try {
            setLoadingSizes(true);
            const res = await sizeService.getAll({ page: 1, size: 100 });
            setSizes(res.data || []);
        } catch {
            message.error("Failed to load sizes");
        } finally {
            setLoadingSizes(false);
        }
    };

    const handleToppingConfirm = async (ids: number[]) => {
        try {
            const res = await Promise.all(ids.map((id) => toppingService.getById(id)));
            setSelectedToppings(res);
        } catch {
            message.error("Failed to load selected toppings");
        }
    };

    const handleRemoveTopping = (id: number) => {
        setSelectedToppings((prev) => prev.filter((t) => t.id !== id));
    };

    const handleRemoveOptionGroup = (id: number) => {
        setSelectedOptionGroups((prev) => prev.filter((t) => t.id !== id));
    };

    const handleOptionGroupConfirm = (groups: OptionGroup[]) => {
        setSelectedOptionGroups(groups);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // upload ảnh
            let uploadedUrls: string[] = ["1.png", "2.png"];
            // if (fileList.length > 0) {
            //     const files = fileList
            //         .filter((f) => f.originFileObj)
            //         .map((f) => f.originFileObj as File);

            //     if (files.length > 0) {
            //         uploadedUrls = await uploadImages(files);
            //     }
            // }

            // Nếu là topping => gọi toppingService
            if (productType === "topping") {
                const payload = {
                    name: values.name,
                    price: values.price,
                    images: [{ image_name: uploadedUrls[0], sort_index: 1 }],
                    is_multi_size: false,
                    isTopping: true,
                };
                const res = await productService.create(payload);
                onProductCreated({
                    name: res.name,
                    type: "topping",
                    productId: res.id,
                    sizes: [],
                });
                form.resetFields();
                setFileList([]);
                return;
            }

            // Nếu là product
            const isMultiSize = productType === "multi_size";
            if (isMultiSize && (!values.sizeIds || values.sizeIds.length === 0)) {
                message.error("Please add at least one size with price.");
                return;
            }

            const imagesPayload: ProductImageInput[] = uploadedUrls.map((url, index) => ({
                image_name: url,
                sort_index: index + 1,
            }));


            const optionValueIds = selectedOptionGroups.flatMap(
                (g) => g.values?.map((v) => v.id) || []
            );

            const payload: CreateProductDto = {
                name: values.name,
                is_multi_size: isMultiSize,
                product_detail: values.product_detail,
                categoryId: values.categoryId ?? null,
                price: isMultiSize ? undefined : values.price,
                sizeIds: isMultiSize
                    ? values.sizeIds.map((s: any) => ({
                        id: Number(s.size_id),
                        price: Number(s.price),
                    }))
                    : undefined,
                toppingIds: selectedToppings.map((t) => t.id),
                optionValueIds,
                images: imagesPayload,
                isTopping: false,
            };

            const response = await productService.create(payload);
            onProductCreated({
                name: response.name,
                type: productType,
                productId: response.id,
                sizes: response.sizes.map((s: any) => s.size),
            });
            form.resetFields();
            setFileList([]);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Already exists!");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Product Type bằng Button Group */}
                <Form.Item label="Product Type">
                    <Segmented
                        options={[
                            { label: "No size", value: "no_size" },
                            { label: "Multi size", value: "multi_size" },
                            { label: "Topping", value: "topping" },
                        ]}
                        value={productType}
                        onChange={(value) => setProductType(value as any)}
                        block
                    />
                </Form.Item>

                <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: "Please enter name" }]}
                        >
                            <Input placeholder="Enter name" />
                        </Form.Item>

                        {productType !== "multi_size" && (
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[
                                    { required: true, message: "Please enter price" },
                                    { type: "number", min: 0 },
                                ]}
                            >
                                <InputNumber<number>
                                    min={0}
                                    style={{ width: "100%" }}
                                    formatter={(value) =>
                                        formatPrice(value, { includeSymbol: false })
                                    }
                                    parser={(value) => parsePrice(value)}
                                    onKeyDown={(e) => restrictInputToNumbers(e)}
                                />
                            </Form.Item>
                        )}

                        {productType === "multi_size" && (
                            <Form.List name="sizeIds">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => {
                                            const selectedSizes =
                                                form.getFieldValue("sizeIds")?.map((s: any) => s?.size_id) || [];
                                            return (
                                                <Flex
                                                    key={field.key}
                                                    align="start"
                                                    gap="small"
                                                    style={{ marginBottom: token.marginXS }}
                                                >
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, "size_id"]}
                                                        rules={[{ required: true, message: "Select size" }]}
                                                        style={{ flexShrink: 0 }}
                                                    >
                                                        {loadingSizes ? (
                                                            <Spin size="small" />
                                                        ) : (
                                                            <Select
                                                                placeholder="Select size"
                                                                style={{ minWidth: 120 }}
                                                                options={sizes
                                                                    .filter(
                                                                        (s) =>
                                                                            !selectedSizes.includes(s.id) ||
                                                                            s.id === form.getFieldValue("sizeIds")?.[field.name]?.size_id
                                                                    )
                                                                    .map((s) => ({
                                                                        label: s.name,
                                                                        value: s.id,
                                                                    }))}
                                                            />
                                                        )}
                                                    </Form.Item>

                                                    {/* 👇 Đây là phần sẽ giãn ra */}
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, "price"]}
                                                        rules={[{ required: true, message: "Enter price" }]}
                                                        style={{ flex: 1 }} // Form.Item chiếm phần còn lại
                                                    >
                                                        <InputNumber<number>
                                                            min={0}
                                                            style={{ width: "100%" }} // InputNumber lấp đầy phần Form.Item
                                                            placeholder="Price"
                                                            formatter={(value) => formatPrice(value, { includeSymbol: false })}
                                                            parser={(value) => parsePrice(value)}
                                                            onKeyDown={(e) => restrictInputToNumbers(e)}
                                                        />
                                                    </Form.Item>

                                                    <Button
                                                        style={{ flexShrink: 0 }}
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        danger
                                                        onClick={() => remove(field.name)}
                                                    />
                                                </Flex>

                                            );
                                        })}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add size
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )}

                        {productType !== "topping" && (
                            <>
                                <Form.Item
                                    name="categoryId"
                                    label="Category"
                                    rules={[{ required: true }]}
                                >
                                    <CategorySelector placeholder="Select category" showUncategorized={false} />
                                </Form.Item>

                                <Form.Item name="product_detail" label="Description">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </>
                        )}
                    </Col>

                    <Col xs={24} md={12}>
                        {productType !== "topping" && (
                            <>
                                {/* Toppings */}
                                <Form.Item label="Toppings">
                                    <Flex vertical gap="small">
                                        <Button icon={<PlusOutlined />} onClick={() => setToppingModalOpen(true)}>
                                            Select
                                        </Button>
                                        {selectedToppings.length > 0 && (
                                            <Space wrap>
                                                {selectedToppings.map((t) => (
                                                    <Flex
                                                        key={t.id}
                                                        align="center"
                                                        gap="small"
                                                        style={{
                                                            border: `1px solid ${token.colorBorderSecondary}`,
                                                            padding: "4px 8px",
                                                            borderRadius: token.borderRadiusSM,
                                                        }}
                                                    >
                                                        <span>
                                                            {t.name} ({formatPrice(t.price, { includeSymbol: true })})
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleRemoveTopping(t.id)}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Space>
                                        )}
                                    </Flex>
                                </Form.Item>

                                {/* Option Groups */}
                                <Form.Item label="Option Groups">
                                    <Flex vertical gap="small">
                                        <Button icon={<PlusOutlined />} onClick={() => setOptionGroupModalOpen(true)}>
                                            Select
                                        </Button>
                                        {selectedOptionGroups.length > 0 && (
                                            <Space wrap>
                                                {selectedOptionGroups.map((group) => (
                                                    <Flex
                                                        key={group.id}
                                                        align="center"
                                                        gap="small"
                                                        style={{
                                                            border: `1px solid ${token.colorBorderSecondary}`,
                                                            padding: "4px 8px",
                                                            borderRadius: token.borderRadiusSM,
                                                        }}
                                                    >
                                                        <span>
                                                            {group.name} ({group.values?.map((v) => v.name).join(", ")})
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleRemoveOptionGroup(group.id)}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Space>
                                        )}
                                    </Flex>
                                </Form.Item>
                            </>
                        )}

                        {/* Upload Image */}
                        {/* Upload Image */}
                        <Form.Item
                            name="images"
                            label="Image"
                            rules={[
                                {
                                    validator: () =>
                                        fileList.length > 0
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("Please upload at least one image!")),
                                },
                            ]}
                        >
                            <OnlyNewImageUploader
                                value={fileList}
                                onChange={setFileList}
                                maxCount={productType === "topping" ? 1 : 10}
                            />
                        </Form.Item>

                    </Col>
                </Row>

                <Flex justify="flex-end" style={{ marginTop: 32 }}>
                    <Space>
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create
                        </Button>
                    </Space>
                </Flex>
            </Form>

            {/* Modals */}
            <OptionGroupSelector
                open={optionGroupModalOpen}
                onClose={() => setOptionGroupModalOpen(false)}
                onConfirm={handleOptionGroupConfirm}
                selectedValueIds={selectedOptionGroups.flatMap((g) => g.values?.map((v) => v.id) || [])}
            />

            <ToppingSelectorModal
                open={toppingModalOpen}
                onClose={() => setToppingModalOpen(false)}
                selectedToppingIds={selectedToppings.map((t) => t.id)}
                onConfirm={handleToppingConfirm}
            />
        </div>
    );
}
