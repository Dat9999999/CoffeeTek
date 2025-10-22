'use client';
import React, { useEffect, useState } from "react";
import {
    Modal, Form, Input, InputNumber, message, Button, Switch, Select, Spin, theme, Space, Flex,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { CreateProductDto, ProductImageInput, Category, Size, Topping } from "@/interfaces";
import { uploadImages } from "@/services/uploadService";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { sizeService } from "@/services/sizeService";
import { toppingService } from "@/services/toppingService";
import { ProductImageUploader } from "./ProductImageUploader";
import { formatPrice, parsePrice, restrictInputToNumbers } from "@/utils/priceFormatter";
import { ToppingSelectorModal } from "./ToppingSelectorModal";

interface CreateProductModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isMultiSize, setIsMultiSize] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSizes, setLoadingSizes] = useState(false);

    // 🧩 Topping state
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const [toppingModalOpen, setToppingModalOpen] = useState(false);

    useEffect(() => {
        if (open) {
            loadCategories();
            loadSizes();
        }
    }, [open]);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await categoryService.getAll({ page: 1, size: 100 });
            setCategories(res.data || []);
        } catch {
            message.error("Failed to load categories");
        } finally {
            setLoadingCategories(false);
        }
    };

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

    // 🧩 Khi user xác nhận chọn topping trong modal
    const handleToppingConfirm = async (ids: number[]) => {
        try {
            const res = await Promise.all(ids.map(id => toppingService.getById(id)));
            setSelectedToppings(res);
        } catch {
            message.error("Failed to load selected toppings");
        }
    };

    // 🧩 Xóa topping khỏi danh sách đã chọn
    const handleRemoveTopping = (id: number) => {
        setSelectedToppings(prev => prev.filter(t => t.id !== id));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // ✅ Validate riêng nếu is_multi_size = true
            if (values.is_multi_size) {
                if (!values.sizeIds || values.sizeIds.length === 0) {
                    message.error("Please add at least one size with price.");
                    return;
                }

                const invalidSize = values.sizeIds.some(
                    (s: any) => !s.size_id || s.price === undefined || s.price === null
                );
                if (invalidSize) {
                    message.error("Each size must have both a size and a price.");
                    return;
                }
            }

            setLoading(true);

            // ✅ Upload ảnh khi bấm Create
            const originFiles = fileList.map(f => f.originFileObj as File).filter(Boolean);
            let uploadedUrls: string[] = [];
            if (originFiles.length > 0) {
                uploadedUrls = await uploadImages(originFiles);
            }

            const imagesPayload: ProductImageInput[] = uploadedUrls.map((url, i) => ({
                image_name: url,
                sort_index: i + 1,
            }));

            const payload: CreateProductDto = {
                name: values.name,
                is_multi_size: values.is_multi_size,
                product_detail: values.product_detail,
                categoryId: values.categoryId ?? null,
                price: values.is_multi_size ? undefined : values.price,
                sizeIds: values.sizeIds?.map((s: any) => ({
                    id: Number(s.size_id),
                    price: Number(s.price),
                })),
                toppingIds: selectedToppings.map(t => t.id),
                images: imagesPayload,
            };

            await productService.create(payload);
            message.success("Product created successfully!");
            onSuccess();
            form.resetFields();
            setFileList([]);
            setSelectedToppings([]);
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Conflict error");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                title="Create Product"
                open={open}
                onCancel={onClose}
                onOk={handleSubmit}
                confirmLoading={loading}
                okText="Create"
                width={800}
                style={{ top: 20 }}
                afterOpenChange={(visible) => {
                    if (!visible) {
                        form.resetFields();
                        setFileList([]);
                        setSelectedToppings([]);
                    }
                }}
            >
                <Form form={form} layout="vertical" initialValues={{ is_multi_size: false }}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: "Please enter product name" }]}
                    >
                        <Input placeholder="Product name" />
                    </Form.Item>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ marginRight: 8 }}>Is Multi Size?</span>
                        <Form.Item name="is_multi_size" valuePropName="checked" noStyle>
                            <Switch
                                checkedChildren="Yes"
                                unCheckedChildren="No"
                                onChange={(v) => setIsMultiSize(v)} />
                        </Form.Item>
                    </div>

                    {!isMultiSize && (
                        <Form.Item
                            name="price"
                            label="Price"
                            rules={[
                                { required: true, message: "Please enter price" },
                                { type: "number", min: 0, message: "Price must be >= 0" },
                            ]}
                        >
                            <InputNumber<number>
                                min={0}
                                style={{ width: "100%" }}
                                formatter={(value) => formatPrice(value, { includeSymbol: false })}
                                parser={(value) => parsePrice(value)}
                                onKeyDown={(e) => restrictInputToNumbers(e)}
                            />
                        </Form.Item>
                    )}

                    {isMultiSize && (
                        <Form.List name="sizeIds">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Flex
                                            key={field.key}
                                            align="center"
                                            gap="small"
                                            wrap
                                            style={{
                                                width: "100%",
                                                justifyContent: "space-between",
                                                marginBottom: token.marginSM
                                            }}
                                        >
                                            {/* Select size */}
                                            <Form.Item
                                                {...field}
                                                name={[field.name, "size_id"]}
                                                rules={[{ required: true, message: "Please select size" }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {loadingSizes ? (
                                                    <Spin size="small" />
                                                ) : (
                                                    <Select
                                                        placeholder="Select size"
                                                        style={{ width: 160 }}
                                                        options={sizes.map((s) => ({
                                                            label: s.name,
                                                            value: s.id,
                                                        }))}
                                                        showSearch
                                                        optionFilterProp="label"
                                                    />
                                                )}
                                            </Form.Item>

                                            {/* Input price */}
                                            <Form.Item
                                                {...field}
                                                name={[field.name, "price"]}
                                                rules={[{ required: true, message: "Please enter price" }]}
                                                style={{ marginBottom: 0, flex: 1 }}
                                            >
                                                <InputNumber<number>
                                                    min={0}
                                                    style={{ width: "100%" }}
                                                    placeholder="Enter price"
                                                    formatter={(value) =>
                                                        formatPrice(value, { includeSymbol: false })
                                                    }
                                                    parser={(value) => parsePrice(value)}
                                                    onKeyDown={(e) => restrictInputToNumbers(e)}
                                                />
                                            </Form.Item>

                                            {/* Delete button */}
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                danger
                                                onClick={() => remove(field.name)}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            />
                                        </Flex>
                                    ))}

                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                            style={{
                                                borderColor: token.colorBorderSecondary,
                                                color: token.colorPrimary,
                                                borderRadius: token.borderRadiusLG,
                                            }}
                                        >
                                            Add size
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    )}

                    <Form.Item name="categoryId" label="Category">
                        {loadingCategories ? (
                            <Spin size="small" />
                        ) : (
                            <Select
                                placeholder="Select category"
                                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                                showSearch
                                optionFilterProp="label"
                            />
                        )}
                    </Form.Item>

                    <Form.Item name="product_detail" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    {/* 🧩 TOPPING SECTION */}
                    <Form.Item label="Toppings">
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => setToppingModalOpen(true)}
                            style={{ marginBottom: 8, marginRight: 4 }}
                        >
                            Select Toppings
                        </Button>

                        {selectedToppings.length > 0 && (
                            <Space wrap>
                                {selectedToppings.map((t) => (
                                    <Flex
                                        key={t.id}
                                        align="center"
                                        gap="small"
                                        style={{
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            borderRadius: 6,
                                            background: "#fafafa",
                                            marginRight: 4
                                        }}
                                    >
                                        <span>{t.name} ({formatPrice(t.price, { includeSymbol: true })}
                                            )</span>
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
                    </Form.Item>

                    <Form.Item
                        name="images"
                        label="Images"
                        rules={[
                            {
                                validator: () =>
                                    fileList.length > 0
                                        ? Promise.resolve()
                                        : Promise.reject(new Error("Please upload at least one image!")),
                            },
                        ]}
                    >
                        <ProductImageUploader value={fileList} onChange={setFileList} maxCount={10} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 🧩 Modal chọn topping */}
            <ToppingSelectorModal
                open={toppingModalOpen}
                onClose={() => setToppingModalOpen(false)}
                selectedToppingIds={selectedToppings.map(t => t.id)}
                onConfirm={handleToppingConfirm}
            />
        </>
    );
};
