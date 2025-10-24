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
import type { UploadFile } from 'antd';
import type {
    CreateProductDto,
    ProductImageInput,
    Size,
    Topping,
    OptionGroup,
} from '@/interfaces';
import {
    sizeService,
    productService,
    uploadImages,
    toppingService,
} from '@/services';
import { OnlyNewImageUploader } from '@/components/features/products';
import { formatPrice, parsePrice, restrictInputToNumbers } from '@/utils/priceFormatter';
import { ToppingSelectorModal } from '@/components/features/toppings';
import { CategorySelector } from '@/components/features/categories/CategorySelector';
import { OptionGroupSelector } from '@/components/features/option-groups/OptionGroupSelector';
import { useRouter } from 'next/navigation';
import { ProductInfo } from '@/app/admin/products/create/page';

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
    const [isMultiSize, setIsMultiSize] = useState(false);
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
            message.error('Failed to load sizes');
        } finally {
            setLoadingSizes(false);
        }
    };

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

    const handleRemoveOptionGroup = (id: number) => {
        setSelectedOptionGroups((prev) => prev.filter((t) => t.id !== id));
    };

    const handleOptionGroupConfirm = (groups: OptionGroup[]) => {
        setSelectedOptionGroups(groups);
    };

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

            setLoading(true);
            // // tat upload image
            // const originFiles = fileList.map((f) => f.originFileObj as File).filter(Boolean);
            // let uploadedUrls: string[] = [];
            // if (originFiles.length > 0) {
            //     uploadedUrls = await uploadImages(originFiles);
            // }

            // const imagesPayload: ProductImageInput[] = uploadedUrls.map((url, i) => ({
            //     image_name: url,
            //     sort_index: i + 1,
            // }));

            const imagesPayload: ProductImageInput[] = [{ image_name: "a.png", sort_index: 1 }, { image_name: "b.png", sort_index: 2 }, { image_name: "c.png", sort_index: 3 }]

            const optionValueIds = selectedOptionGroups.flatMap(
                (g) => g.values?.map((v) => v.id) || []
            );

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
                toppingIds: selectedToppings.map((t) => t.id),
                optionValueIds: optionValueIds,
                images: imagesPayload,
                isTopping: false,
            };

            const response = await productService.create(payload);

            onProductCreated({
                name: response.name,
                type: values.is_multi_size ? 'multi_size' : 'no_size',
                productId: response.id,
                sizes: response.sizes.map((s: any) => s.size),
            });
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || 'Conflict error');
            } else if (!err.errorFields) {
                message.error('An error occurred!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div >
            {/* <Flex align="center" justify="space-between" wrap style={{ marginBottom: 24 }}>
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => {
                            console.log("Clicked back button");
                            router.push('/admin/products');

                        }}
                        aria-label="Back"
                    />

                    <Title level={3} style={{ margin: 0 }}>
                        Create Product
                    </Title>
                </Space>
            </Flex> */}

            <Form
                form={form}
                layout="vertical"
                initialValues={{ is_multi_size: false }}
                onFinish={handleSubmit}
            >
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
                                rules={[
                                    { required: true, message: 'Please enter price' },
                                    { type: 'number', min: 0 },
                                ]}
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
                                                align="center"
                                                gap="small"
                                                wrap
                                                style={{
                                                    marginBottom: token.marginSM,
                                                }}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'size_id']}
                                                    rules={[{ required: true }]}
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

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'price']}
                                                    rules={[{ required: true }]}
                                                    style={{ marginBottom: 0, flex: 1 }}
                                                >
                                                    <InputNumber<number>
                                                        min={0}
                                                        style={{ width: '100%' }}
                                                        placeholder="Enter price"
                                                        formatter={(value) =>
                                                            formatPrice(value, {
                                                                includeSymbol: false,
                                                            })
                                                        }
                                                        parser={(value) => parsePrice(value)}
                                                        onKeyDown={(e) =>
                                                            restrictInputToNumbers(e)
                                                        }
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
                            <CategorySelector
                                placeholder="Select category"
                                showUncategorized={false}
                            />
                        </Form.Item>

                        <Form.Item name="product_detail" label="Description">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Toppings">
                            <Flex vertical gap="small">
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setToppingModalOpen(true)}
                                    style={{
                                        alignSelf: 'flex-start',
                                        maxWidth: "100%",
                                        whiteSpace: 'normal',
                                        height: 'auto'
                                    }}
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
                                                    {formatPrice(t.price, {
                                                        includeSymbol: true,
                                                    })}
                                                    )
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

                        <Form.Item label="Option Groups">
                            <Flex vertical gap="small">
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setOptionGroupModalOpen(true)}
                                    style={{
                                        alignSelf: 'flex-start',
                                        maxWidth: "100%",
                                        whiteSpace: 'normal',
                                        height: 'auto'
                                    }}
                                >
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
                                                    padding: '4px 8px',
                                                    borderRadius: token.borderRadiusSM,
                                                }}
                                            >
                                                <span>
                                                    {group.name} (
                                                    {group.values?.map((v) => v.name).join(', ')})
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

                        <Form.Item
                            name="images"
                            label="Images"
                            rules={[
                                {
                                    validator: () =>
                                        fileList.length > 0
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                new Error('Please upload at least one image!')
                                            ),
                                },
                            ]}
                        >
                            <OnlyNewImageUploader
                                value={fileList}
                                onChange={setFileList}
                                maxCount={10}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="flex-end" style={{ marginTop: 32 }}>
                    <Space>
                        <Button onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
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
