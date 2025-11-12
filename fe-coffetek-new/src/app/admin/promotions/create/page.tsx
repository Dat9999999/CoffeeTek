"use client";

import { useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    message,
    Table,
    Button,
    Typography,
    Space,
    theme,
    Flex,
    Divider,
    InputNumber,
    Card,
    Row,
    Col,
} from "antd";
import { PromotionItemDto, promotionService } from "@/services/promotionService";
import { Product, Size } from "@/interfaces";
import dayjs from "dayjs";
import { formatPrice } from "@/utils";
import {
    ArrowLeftOutlined,
    EditOutlined,
    PlusOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProductSelectorModal } from "@/components/features/products";
import { AppImage, AppImageSize } from "@/components/commons";

const { Text, Title } = Typography;

export default function CreatePromotionPage() {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [productNewPrices, setProductNewPrices] = useState<Record<string, number>>({});
    const [editPriceModalVisible, setEditPriceModalVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [currentSize, setCurrentSize] = useState<Size | null>(null);
    const [currentProductSizeId, setCurrentProductSizeId] = useState<number | null>(null);
    const [currentOldPrice, setCurrentOldPrice] = useState<number>(0);
    const [editPriceForm] = Form.useForm();
    const [selectorVisible, setSelectorVisible] = useState(false);
    const router = useRouter();

    // 🧩 Submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const [startDate, endDate] = values.validPeriod || [];
            const items: PromotionItemDto[] = [];

            selectedProducts.forEach((p) => {
                if (!p.is_multi_size || p.isTopping) {
                    const key = `${p.id}-default`;
                    const oldPrice = p.price ?? 0;
                    const newPrice = productNewPrices[key] ?? oldPrice;
                    if (newPrice < oldPrice)
                        items.push({ productId: p.id, newPrice, productSizedId: null });
                } else {
                    p.sizes?.forEach((ps) => {
                        const key = `${p.id}-${ps.id}`;
                        const oldPrice = ps.price;
                        const newPrice = productNewPrices[key] ?? oldPrice;
                        if (newPrice < oldPrice)
                            items.push({ productId: p.id, productSizedId: ps.id, newPrice });
                    });
                }
            });

            const formattedValues = {
                ...values,
                startDate: startDate ? dayjs(startDate).toISOString() : undefined,
                endDate: endDate ? dayjs(endDate).toISOString() : undefined,
                validPeriod: undefined,
                items,
            };

            if (items.length === 0) {
                message.warning("Please set at least one product with a lower price to create a promotion.");
                setLoading(false);
                return;
            }

            await promotionService.create(formattedValues);
            message.success("Your promotion has been created successfully!");
            form.resetFields();
            setSelectedProducts([]);
            setProductNewPrices({});

            router.push("/admin/promotions");
        } catch (err: any) {
            const serverMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong, please try again.";

            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "This promotion name already exists.");
            } else if (err?.response?.status === 400) {
                // ✅ Trường hợp lỗi overlap date
                message.warning(serverMessage);
            } else if (!err.errorFields) {
                message.error(serverMessage);
            }
        }
        finally {
            setLoading(false);
        }
    };

    // 🧩 Edit price modal
    const handleEditPrice = (
        product: Product,
        productSizeId: number | null = null,
        size: Size | null = null
    ) => {
        setCurrentProduct(product);
        setCurrentProductSizeId(productSizeId);
        setCurrentSize(size);
        const key = `${product.id}-${productSizeId ?? "default"}`;
        const oldPrice =
            productSizeId !== null
                ? product.sizes?.find((ps) => ps.id === productSizeId)?.price ?? 0
                : product.price ?? 0;
        const initialNewPrice = productNewPrices[key] ?? oldPrice;
        setCurrentOldPrice(oldPrice);
        editPriceForm.setFieldsValue({
            newPrice: initialNewPrice,
            discountPercentage:
                oldPrice === 0 ? 0 : Number(((oldPrice - initialNewPrice) / oldPrice * 100).toFixed(2)),
        });
        setEditPriceModalVisible(true);
    };

    const handleSavePrice = async () => {
        try {
            const values = await editPriceForm.validateFields();
            const key = `${currentProduct!.id}-${currentProductSizeId ?? "default"}`;
            setProductNewPrices((prev) => ({
                ...prev,
                [key]: values.newPrice,
            }));
            setEditPriceModalVisible(false);
            editPriceForm.resetFields();
        } catch {
            message.error("Could not update the price. Please try again!");
        }
    };

    // const allSizes = new Set<string>();
    // selectedProducts.forEach((p) => {
    //     if (p.is_multi_size && !p.isTopping && p.sizes) {
    //         p.sizes.forEach((ps) => allSizes.add(ps.size.name));
    //     }
    // });
    // const sortedSizes = Array.from(allSizes).sort();
    // const hasMultiSize = selectedProducts.some(
    //     (p) => p.is_multi_size && !p.isTopping && p.sizes && p.sizes.length > 0
    // );

    const allSizesMap = new Map<string, Size>();
    selectedProducts.forEach((p) => {
        if (p.is_multi_size && !p.isTopping && p.sizes) {
            p.sizes.forEach((ps) => {
                // Dùng Map để lưu object Size duy nhất (dựa vào tên)
                if (!allSizesMap.has(ps.size.name)) {
                    allSizesMap.set(ps.size.name, ps.size);
                }
            });
        }
    });

    // Sắp xếp mảng các object Size dựa trên sort_index, sau đó lấy tên
    const sortedSizes = Array.from(allSizesMap.values())
        .sort((a, b) => a.sort_index - b.sort_index)
        .map((size) => size.name);

    const hasMultiSize = selectedProducts.some(
        (p) => p.is_multi_size && !p.isTopping && p.sizes && p.sizes.length > 0
    );

    const priceColumn = hasMultiSize
        ? {
            title: "Price",
            children: sortedSizes.map((sizeName, i) => ({
                title: sizeName,
                key: sizeName,
                render: (record: Product) => {
                    // ✅ Nếu product không phải multi size, merge toàn bộ cột size thành 1 ô
                    if (!record.is_multi_size || record.isTopping) {
                        if (i === 0) {
                            // hiển thị giá 1 lần, colspan bằng số size columns
                            const key = `${record.id}-default`;
                            const oldPrice = record.price ?? 0;
                            const newPrice = productNewPrices[key] ?? oldPrice;
                            const percentChange =
                                oldPrice === 0
                                    ? "0.00"
                                    : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                            const isChanged = newPrice < oldPrice;

                            return {
                                children: (
                                    <Space>
                                        {isChanged && (
                                            <Text delete>
                                                {formatPrice(oldPrice, { includeSymbol: true })}
                                            </Text>
                                        )}
                                        <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                                        {isChanged && (
                                            <Space size={4}>
                                                <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                                <Text type="success">{percentChange}%</Text>
                                            </Space>
                                        )}
                                        <Button
                                            icon={<EditOutlined />}
                                            type="link"
                                            onClick={() => handleEditPrice(record)}
                                        />
                                    </Space>
                                ),
                                props: { colSpan: sortedSizes.length }, // 👈 colspan toàn bộ các size columns
                            };
                        } else {
                            // các ô còn lại trong hàng bị merge -> ẩn
                            return { children: null, props: { colSpan: 0 } };
                        }
                    }

                    // ✅ Product có nhiều size thì hiển thị bình thường
                    const ps = record.sizes?.find((s) => s.size.name === sizeName);
                    const key = ps ? `${record.id}-${ps.id}` : `${record.id}-default`;
                    const oldPrice = ps?.price ?? record.price ?? 0;
                    const newPrice = productNewPrices[key] ?? oldPrice;
                    const percentChange =
                        oldPrice === 0 ? "0.00" : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                    const isChanged = newPrice < oldPrice;

                    return {
                        children: (
                            <Space>
                                {isChanged && (
                                    <Text delete>
                                        {formatPrice(oldPrice, { includeSymbol: true })}
                                    </Text>
                                )}
                                <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                                {isChanged && (
                                    <Space size={4}>
                                        <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                        <Text type="success">{percentChange}%</Text>
                                    </Space>
                                )}
                                <Button
                                    icon={<EditOutlined />}
                                    type="link"
                                    onClick={() => handleEditPrice(record, ps?.id ?? null, ps?.size ?? null)}
                                />
                            </Space>
                        ),
                    };
                },
            })),
        }
        : {
            title: "Price",
            key: "price",
            render: (record: Product) => {
                const key = `${record.id}-default`;
                const oldPrice = record.price ?? 0;
                const newPrice = productNewPrices[key] ?? oldPrice;
                const percentChange =
                    oldPrice === 0 ? "0.00" : ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
                const isChanged = newPrice < oldPrice;
                return (
                    <Space>
                        {isChanged && <Text delete>{formatPrice(oldPrice, { includeSymbol: true })}</Text>}
                        <span>{formatPrice(newPrice, { includeSymbol: true })}</span>
                        {isChanged && (
                            <Space size={4}>
                                <ArrowDownOutlined style={{ color: token.colorSuccess }} />
                                <Text type="success">{percentChange}%</Text>
                            </Space>
                        )}
                        <Button icon={<EditOutlined />} type="link" onClick={() => handleEditPrice(record)} />
                    </Space>
                );
            },
        };


    const selectedProductsColumns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (_: any, record: Product) => {
                const imageSrc = record?.images?.[0]?.image_name || "/placeholder.png";
                return (
                    <Space size={"middle"}>
                        <AppImageSize preview={false} src={imageSrc} alt={record.name} width={40} height={40} />
                        <span>{record.name}</span>
                    </Space>
                );
            }
        },
        priceColumn,
    ];

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Header */}
            <Flex align="center" justify="space-between" wrap style={{ marginBottom: 24 }}>
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => router.push("/admin/promotions")}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        Create a New Promotion
                    </Title>
                </Space>
            </Flex>

            {/* Form */}
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <Card title="Promotion Details" bordered={false} style={{ marginBottom: 32 }}>
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="name"
                                    label="Promotion Name"
                                    rules={[{ required: true, message: "Please enter a promotion name." }]}
                                >
                                    <Input placeholder="E.g. Summer Sale 2025" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="validPeriod"
                                    label="Valid Period"
                                    rules={[{ required: true, message: "Please choose a date range." }]}
                                >
                                    <DatePicker.RangePicker
                                        format="DD/MM/YYYY"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="Description"
                                    rules={[{ required: true, message: "Please add a short description." }]}
                                >
                                    <Input.TextArea rows={3} placeholder="Describe this promotion briefly..." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>

                {/* Table */}
                <Card
                    title="Products in this Promotion"
                    bordered={false}
                    extra={
                        <Button
                            icon={<PlusOutlined />}
                            type="dashed"
                            onClick={() => setSelectorVisible(true)}
                        >
                            Add Products
                        </Button>
                    }
                >
                    <Table

                        bordered
                        columns={selectedProductsColumns}
                        dataSource={selectedProducts}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: "max-content" }}
                        locale={{ emptyText: "No products added yet" }}
                    />
                </Card>

                {/* ✅ Create button under table */}
                <Flex justify="end" style={{ marginTop: 24 }}>
                    <Button
                        type="primary"
                        size="middle"
                        loading={loading}
                        onClick={() => form.submit()}
                    >
                        Create
                    </Button>
                </Flex>
            </div>

            {/* Modals */}
            <ProductSelectorModal
                visible={selectorVisible}
                onClose={() => setSelectorVisible(false)}
                onConfirm={(products) => {
                    setSelectedProducts(products);
                    setSelectorVisible(false);
                }}
                initialSelectedProducts={selectedProducts}
            />

            <Modal
                title={`Adjust Price${currentSize ? ` for ${currentSize.name}` : ""}`}
                open={editPriceModalVisible}
                onOk={handleSavePrice}
                onCancel={() => {
                    setEditPriceModalVisible(false);
                    editPriceForm.resetFields();
                }}
                okText="Save"
                getContainer={false}
                centered
            >
                <Form
                    form={editPriceForm}
                    layout="vertical"
                    onValuesChange={(changedValues) => {
                        if ("discountPercentage" in changedValues) {
                            const percent = changedValues.discountPercentage || 0;
                            const newP = currentOldPrice * (1 - percent / 100);
                            editPriceForm.setFieldsValue({ newPrice: Math.round(newP) });
                        }
                        if ("newPrice" in changedValues) {
                            const np = changedValues.newPrice || 0;
                            const percent =
                                currentOldPrice === 0 ? 0 : ((currentOldPrice - np) / currentOldPrice) * 100;
                            editPriceForm.setFieldsValue({
                                discountPercentage: Number(percent.toFixed(2)),
                            });
                        }
                    }}
                >
                    <Form.Item
                        name="discountPercentage"
                        label="Discount (%)"
                        rules={[
                            { required: true, message: "Please enter discount percentage." },
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null) return Promise.resolve();
                                    if (value < 0 || value > 100)
                                        return Promise.reject(
                                            new Error("Discount must be between 0% and 100%.")
                                        );
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            step={0.01}
                            addonAfter="%"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPrice"
                        label="New Price"
                        rules={[
                            { required: true, message: "Please enter the new price." },
                            {
                                validator: (_, value) =>
                                    value <= currentOldPrice
                                        ? Promise.resolve()
                                        : Promise.reject(new Error("The new price must be lower than the current price.")),
                            },
                        ]}
                    >
                        <InputNumber placeholder="Enter new price" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
