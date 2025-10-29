// components/LeftSider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Menu, Spin } from "antd";
import { orderService } from "@/services/orderService";
import type { Order } from "@/interfaces";
import dayjs from "dayjs";

interface LeftSiderProps {
    onSelect: (orderId: number) => void;
    defaultSelected?: number | null;
}

export default function LeftSider({ onSelect, defaultSelected }: LeftSiderProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch orders with status pending and paid
                // Assuming API supports comma-separated searchStatus
                const res = await orderService.getAll({
                    searchStatus: "pending",
                    page: 1,
                    size: 100, // Adjust as needed, assuming pagination
                    orderBy: "created_at",
                    orderDirection: "desc",
                });
                setOrders(res.data || res); // Handle paginated or non-paginated response
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const menuItems = orders.map((order) => ({
        key: order.id.toString(),
        label: `Order #${order.id} - ${order.status.toUpperCase()} (${dayjs(order.created_at).format("DD-MM-YYYY HH:mm")})`,
    }));

    return (
        <div style={{ height: "100%", overflowY: "auto" }}>
            {loading ? (
                <Spin style={{ padding: 24 }} />
            ) : (
                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={({ key }) => onSelect(Number(key))}
                    defaultSelectedKeys={defaultSelected ? [defaultSelected.toString()] : []}
                    style={{ height: "100%", borderRight: 0 }}
                />
            )}
        </div>
    );
}