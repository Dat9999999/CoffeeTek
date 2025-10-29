// app/admin/orders/page.tsx
"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import LeftSider from "./LeftSider";
import OrderDetailComponent from "./OrderDetailComponent";

const { Sider, Content } = Layout;

export default function OrdersPage() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={300} style={{ background: "#fff" }}>
                <LeftSider onSelect={setSelectedOrderId} defaultSelected={selectedOrderId} />
            </Sider>
            <Layout>
                <Content style={{ padding: "24px", background: "#fff" }}>
                    <OrderDetailComponent orderId={selectedOrderId} />
                </Content>
            </Layout>
        </Layout>
    );
}