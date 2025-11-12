"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flex, Spin, Button, message, Typography, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { orderService } from "@/services/orderService";
import { Order } from "@/interfaces";
import { OrderDetailComponent } from "@/components/features/orders";

const { Text, Title } = Typography;

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getById(Number(id));
                setOrder(res);
            } catch (err) {
                message.error("Error getting order detail.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading)
        return (
            <Flex align="center" justify="center" style={{ height: "80vh" }}>
                <Spin size="large" />
            </Flex>
        );

    if (!order)
        return (
            <Flex vertical align="center" justify="center" style={{ height: "80vh" }}>
                <Text type="secondary">Order #{id} not found</Text>
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={() => router.push("/admin/orders")}
                >
                    Back to orders page
                </Button>
            </Flex>
        );

    return (
        <div style={{ padding: 6 }}>

            {/* ✅ Reuse OrderDetailComponent, disable buttons */}
            <OrderDetailComponent
                orderId={order.id}
                activeConfirmButton={false}
                header={
                    <Space align="center" wrap>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            type="text"
                            onClick={() => router.push('/admin/orders')}
                        />
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Order #{order.id} Detail
                        </Title>
                    </Space>
                }
            />
        </div>
    );
}
