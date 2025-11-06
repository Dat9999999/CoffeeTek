// src/components/features/orders/OrderEditInfoModal.tsx
"use client";

import React, { useEffect } from "react";
import {
    Modal, Form, Input, Button, Flex, Avatar, Typography, message
} from "antd";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import { UserSearchSelector } from "@/components/features/pos";
import { Order, User } from "@/interfaces";
import { orderService } from "@/services/orderService";

const { Text } = Typography;

interface OrderEditInfoModalProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onSuccess: () => void;
}

export const OrderEditInfoModal: React.FC<OrderEditInfoModalProps> = ({
    open,
    onClose,
    order,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [selectedCustomer, setSelectedCustomer] = React.useState<User | null>(null);

    useEffect(() => {
        if (order) {
            setSelectedCustomer(order.Customer);
            form.setFieldsValue({
                note: order.note,
            });
        }
    }, [order, form]);

    const handleSelectCustomer = (user: User | null) => {
        setSelectedCustomer(user);
    };

    const handleDeleteCustomer = () => {
        setSelectedCustomer(null);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                customerPhone: selectedCustomer?.phone_number || null,
                note: values.note,
            };
            await orderService.update(order!.id, data);
            message.success("Order info updated successfully");
            onSuccess();
            onClose();
        } catch (err) {
            message.error("Failed to update order info");
        }
    };

    return (
        <Modal
            title="Edit Order Info"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSubmit}>
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Customer">
                    <UserSearchSelector
                        style={{ width: "100%" }}
                        onSelect={handleSelectCustomer}
                    />
                    {selectedCustomer && (
                        <Flex
                            align="center"
                            justify="space-between"
                            style={{
                                marginTop: 12,
                                padding: 10,
                                borderRadius: 8,
                                backgroundColor: "#fafafa",
                                border: "1px solid #eee",
                            }}
                        >
                            <Flex align="center" gap={12}>
                                <Avatar
                                    src={selectedCustomer.detail?.avatar_url}
                                    icon={<UserOutlined />}
                                    size={40}
                                />
                                <div>
                                    <Text strong>
                                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                                    </Text>
                                    <br />
                                    <Text type="secondary">{selectedCustomer.phone_number}</Text>
                                    <br />
                                    <Text type="secondary">Email: {selectedCustomer.email || "N/A"}</Text>
                                </div>
                            </Flex>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={handleDeleteCustomer}
                                danger
                            />
                        </Flex>
                    )}
                </Form.Item>
                <Form.Item name="note" label="Note">
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};