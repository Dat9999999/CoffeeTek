'use client';

import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    message,
    Button,
    Switch,
    Select,
    Spin,
    Space,
    Flex,
    Row,
    Col,
    Card,
    Typography,
    theme,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { Size, Topping, OptionGroup, ProductDetail } from '@/interfaces';
import {
    sizeService,
    productService,
    toppingService,
    uploadImages,
} from '@/services';
import { formatPrice, parsePrice, restrictInputToNumbers } from '@/utils/priceFormatter';
import { ToppingSelectorModal } from '@/components/features/toppings';
import { CategorySelector } from '@/components/features/categories/CategorySelector';
import { OptionGroupSelector } from '@/components/features/option-groups/OptionGroupSelector';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ProductImageUploader, ProductImageState } from '@/components/features/products';

const { Title } = Typography;

export default function UpdateProductPage() {
    const router = useRouter();
    const { id } = useParams();
    const productId = Number(id);
    const { token } = theme.useToken();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isMultiSize, setIsMultiSize] = useState(false);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const [selectedOptionGroups, setSelectedOptionGroups] = useState<OptionGroup[]>([]);
    const [toppingModalOpen, setToppingModalOpen] = useState(false);
    const [optionGroupModalOpen, setOptionGroupModalOpen] = useState(false);

    // --- Hình ảnh ---
    const [productImages, setProductImages] = useState<ProductImageState[]>([]);

    // ===== Fetch sizes =====
    useEffect(() => {
        (async () => {
            try {
                const res = await sizeService.getAll({ page: 1, size: 100 });
                setSizes(res.data || []);
            } catch {
                message.error('Failed to load sizes');
            }
        })();
    }, []);

    // ===== Fetch product =====
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res: ProductDetail = await productService.getById(productId);
                form.setFieldsValue({
                    name: res.name,
                    is_multi_size: res.is_multi_size,
                    product_detail: res.product_detail,
                    categoryId: res.category_id,
                    price: res.price ?? undefined,
                    sizeIds: res.sizes?.map((s) => ({
                        size_id: s?.size?.id,
                        price: s.price,
                    })),
                });
                setIsMultiSize(res.is_multi_size);
                setSelectedToppings(res.toppings ?? []);
                setSelectedOptionGroups(res.optionGroups ?? []);

                // ✅ Set ảnh từ server
                const imgs = (res.images || []).map((img: any, idx: number) => ({
                    id: img.id,
                    uid: String(img.id),
                    image_name: img.image_name,
                    url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.image_name}`,
                    sort_index: img.sort_index ?? idx + 1,
                    isNew: false,
                    isUpdate: true,
                    status: 'done',
                })) as ProductImageState[];

                setProductImages(imgs);
            } catch (err) {
                console.error(err);
                message.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, form]);

    // ====== Handle toppings ======
    const handleToppingConfirm = async (ids: number[]) => {
        try {
            const res = await Promise.all(ids.map((id) => toppingService.getById(id)));
            setSelectedToppings(res);
        } catch {
            message.error('Failed to load selected toppings');
        }
    };

    const handleRemoveTopping = (id: number) => {
        setSelectedToppings((prev) => prev.filter((t) => t.id !== id));
    };

    // ====== Handle option groups ======
    const handleRemoveOptionGroup = (id: number) => {
        setSelectedOptionGroups((prev) => prev.filter((g) => g.id !== id));
    };

    const handleOptionGroupConfirm = (groups: OptionGroup[]) => {
        setSelectedOptionGroups(groups);
    };

    // ====== Submit ======
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.is_multi_size) {
                if (!values.sizeIds || values.sizeIds.length === 0) {
                    message.error('Please add at least one size with price.');
                    return;
                }
                const invalidSize = values.sizeIds.some(
                    (s: any) => !s.size_id || s.price === undefined || s.price === null
                );
                if (invalidSize) {
                    message.error('Each size must have both a size and a price.');
                    return;
                }
            }

            if (productImages.length === 0) {
                message.error('Please upload at least one image.');
                return;
            }

            setSubmitting(true);

            // ✅ 1️⃣ Upload ảnh mới
            const newImages = productImages.filter((img) => img.isNew && img.originFileObj);
            let uploadedImageNames: string[] = [];

            if (newImages.length > 0) {
                const files = newImages.map((img) => img.originFileObj!) as File[];
                uploadedImageNames = await uploadImages(files);
                if (uploadedImageNames.length !== newImages.length) {
                    throw new Error('Upload ảnh thất bại (số lượng ảnh không khớp)');
                }
            }

            // ✅ 2️⃣ Gán tên file upload cho ảnh mới
            const updatedImages = productImages.map((img) => {
                if (img.isNew && img.originFileObj) {
                    const index = newImages.findIndex((n) => n.uid === img.uid);
                    return {
                        ...img,
                        image_name: uploadedImageNames[index],
                        isNew: false,
                        isUpdate: true,
                    };
                }
                return img;
            });

            // ✅ 3️⃣ Payload ảnh cuối cùng
            const payloadImages = updatedImages.map((img, idx) => ({
                image_name: img.image_name!,
                sort_index: idx + 1,
            }));

            const optionValueIds = selectedOptionGroups.flatMap(
                (g) => g.values?.map((v) => v.id) || []
            );

            const payload = {
                name: values.name,
                is_multi_size: values.is_multi_size,
                product_detail: values.product_detail,
                categoryId: values.categoryId,
                price: values.is_multi_size ? null : values.price,
                sizeIds: values.sizeIds?.map((s: any) => ({
                    id: Number(s.size_id),
                    price: Number(s.price),
                })),
                toppingIds: selectedToppings.map((t) => t.id),
                optionValueIds,
                images: payloadImages,
            };

            await productService.update(productId, payload);

            setProductImages(updatedImages);
            message.success('Product updated successfully');
            router.push('/admin/products');
        } catch (err: any) {
            console.error(err);
            if (!err.errorFields) message.error('Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Flex align="center" justify="space-between" wrap style={{ marginBottom: 24 }}>
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => router.push('/admin/products')}
                    />
                    <Title level={3}>Update Product</Title>
                </Space>
            </Flex>

            <Card>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={[24, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please enter product name' }]}
                            >
                                <Input placeholder="Product name" />
                            </Form.Item>

                            <Flex align="center" gap="small" style={{ marginBottom: 16 }}>
                                <span>Is Multi Size?</span>
                                <Form.Item name="is_multi_size" valuePropName="checked" noStyle>
                                    <Switch
                                        checkedChildren="Yes"
                                        unCheckedChildren="No"
                                        onChange={(v) => setIsMultiSize(v)}
                                    />
                                </Form.Item>
                            </Flex>

                            {!isMultiSize && (
                                <Form.Item
                                    name="price"
                                    label="Price"
                                    rules={[{ required: true, message: 'Please enter price' }]}
                                >
                                    <InputNumber<number>
                                        min={0}
                                        style={{ width: '100%' }}
                                        formatter={(value) =>
                                            formatPrice(value, { includeSymbol: false })
                                        }
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
                                                    align="flex-start"
                                                    gap="small"
                                                    style={{ marginBottom: token.marginSM }}
                                                    wrap
                                                >
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'size_id']}
                                                        rules={[{ required: true, message: 'Please select size' }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Select
                                                            placeholder="Select size"
                                                            // style={{ width: 160 }}
                                                            options={sizes.map((s) => ({
                                                                label: s.name,
                                                                value: s.id,
                                                            }))}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'price']}
                                                        rules={[{ required: true, message: 'Please enter price' }]}
                                                        style={{ marginBottom: 0, flex: 1 }}
                                                    >
                                                        <InputNumber<number>
                                                            min={0}
                                                            style={{ width: '100%' }}
                                                            placeholder="Enter price"

                                                            formatter={(value) =>
                                                                formatPrice(value, { includeSymbol: false })
                                                            }
                                                            parser={(value) => parsePrice(value)}
                                                            onKeyDown={(e) => restrictInputToNumbers(e)}
                                                        />
                                                    </Form.Item>

                                                    <Button
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        danger
                                                        onClick={() => remove(field.name)}
                                                    />
                                                </Flex>
                                            ))}

                                            <Form.Item>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    Add size
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            )}

                            <Form.Item name="categoryId" label="Category">
                                <CategorySelector placeholder="Select category" />
                            </Form.Item>

                            <Form.Item name="product_detail" label="Description">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            {/* Toppings */}
                            <Form.Item label="Toppings">
                                <Flex vertical gap="small">
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => setToppingModalOpen(true)}
                                        style={{ alignSelf: 'flex-start', height: 'auto' }}
                                    >
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
                                                        padding: '4px 8px',
                                                        borderRadius: token.borderRadiusSM,
                                                    }}
                                                >
                                                    <span>
                                                        {t.name} (
                                                        {formatPrice(t.price, { includeSymbol: true })})
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

                            {/* Option groups */}
                            <Form.Item label="Option Groups">
                                <Flex vertical gap="small">
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => setOptionGroupModalOpen(true)}
                                        style={{ alignSelf: 'flex-start', height: 'auto' }}
                                    >
                                        Select
                                    </Button>

                                    {selectedOptionGroups.length > 0 && (
                                        <Space wrap>
                                            {selectedOptionGroups.map((g) => (
                                                <Flex
                                                    key={g.id}
                                                    align="center"
                                                    gap="small"
                                                    style={{
                                                        border: `1px solid ${token.colorBorderSecondary}`,
                                                        padding: '4px 8px',
                                                        borderRadius: token.borderRadiusSM,
                                                    }}
                                                >
                                                    <span>
                                                        {g.name} (
                                                        {g.values?.map((v) => v.name).join(', ')})
                                                    </span>
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() =>
                                                            handleRemoveOptionGroup(g.id)
                                                        }
                                                    />
                                                </Flex>
                                            ))}
                                        </Space>
                                    )}
                                </Flex>
                            </Form.Item>

                            {/* ✅ Upload Images */}
                            <Form.Item label="Images" required>
                                <ProductImageUploader
                                    value={productImages}
                                    onChange={(imgs: ProductImageState[]) => setProductImages(imgs)}
                                    maxCount={10}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="flex-end" style={{ marginTop: 32 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Update
                            </Button>
                        </Space>
                    </Flex>
                </Form>
            </Card>

            {/* Modals */}
            <OptionGroupSelector
                open={optionGroupModalOpen}
                onClose={() => setOptionGroupModalOpen(false)}
                onConfirm={handleOptionGroupConfirm}
                selectedValueIds={selectedOptionGroups.flatMap(
                    (g) => g.values?.map((v) => v.id) || []
                )}
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
