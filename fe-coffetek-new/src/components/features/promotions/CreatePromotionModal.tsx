"use client";

import { useState } from "react";
import { Modal, Form, Input, DatePicker, message, Table, Button } from "antd";
import { promotionService } from "@/services/promotionService";

import { Promotion, PromotionItem, Product } from "@/interfaces";
import dayjs from "dayjs";
import { ProductSelectorTable } from "../products";

interface CreatePromotionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newPromotion: Promotion) => void;
}

export function CreatePromotionModal({ open, onClose, onSuccess }: CreatePromotionModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<PromotionItem[]>([]);
    const [editPriceModalVisible, setEditPriceModalVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<PromotionItem | null>(null);
    const [editPriceForm] = Form.useForm();

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const [startDate, endDate] = values.validPeriod || [];
            const formattedValues = {
                ...values,
                startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
                endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
                validPeriod: undefined,
                items: selectedItems, // Include selected items
            };

            const res = await promotionService.create(formattedValues);
            message.success("Promotion created successfully!");
            onSuccess(res);
            form.resetFields();
            setSelectedItems([]);
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Name already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle price edit
    const handleEditPrice = (item: PromotionItem) => {
        setCurrentProduct(item);
        editPriceForm.setFieldsValue({ newPrice: item.newPrice });
        setEditPriceModalVisible(true);
    };

    const handleSavePrice = async () => {
        try {
            const values = await editPriceForm.validateFields();
            setSelectedItems((prev) =>
                prev.map((item) =>
                    item.productId === currentProduct?.productId
                        ? { ...item, newPrice: values.newPrice }
                        : item
                )
            );
            setEditPriceModalVisible(false);
            editPriceForm.resetFields();
        } catch (error) {
            message.error("Failed to update price!");
        }
    };

    // Columns for selected products table
    const selectedProductsColumns = [
        {
            title: "Product ID",
            dataIndex: "productId",
            key: "productId",
        },
        {
            title: "New Price",
            dataIndex: "newPrice",
            key: "newPrice",
            render: (price: number) => `$${price.toFixed(2)}`,
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: PromotionItem) => (
                <Button onClick={() => handleEditPrice(record)}>Edit Price</Button>
            ),
        },
    ];

    return (
        <Modal
            title="Create Promotion"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setSelectedItems([]);
                }
            }}
            width={800}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please input promotion name!" }]}
                >
                    <Input placeholder="Enter promotion name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please input description!" }]}
                >
                    <Input.TextArea placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                    name="validPeriod"
                    label="Valid Period"
                    rules={[{ required: true, message: "Please select the valid period!" }]}
                >
                    <DatePicker.RangePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
            </Form>

            <h3>Select Products</h3>
            <ProductSelectorTable onSelectionChange={setSelectedItems} initialSelectedItems={selectedItems} />

            <h3 style={{ marginTop: 16 }}>Selected Products</h3>
            <Table
                columns={selectedProductsColumns}
                dataSource={selectedItems}
                rowKey="productId"
                pagination={false}
            />

            {/* Modal for editing price */}
            <Modal
                title="Edit Product Price"
                open={editPriceModalVisible}
                onOk={handleSavePrice}
                onCancel={() => {
                    setEditPriceModalVisible(false);
                    editPriceForm.resetFields();
                }}
                okText="Save"
            >
                <Form form={editPriceForm} layout="vertical">
                    <Form.Item
                        name="newPrice"
                        label="New Price"
                        rules={[{ required: true, message: "Please input the new price!" }]}
                    >
                        <Input type="number" placeholder="Enter new price" />
                    </Form.Item>
                </Form>
            </Modal>
        </Modal>
    );
}