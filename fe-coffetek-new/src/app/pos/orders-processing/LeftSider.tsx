"use client";

import React from "react";
import { Layout, Menu, Spin, theme, Typography, Button, Divider, type Breakpoint, Tag } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { Order } from "@/interfaces";
import dayjs from "dayjs";
import { useDarkMode } from "@/components/providers";
import { getStatusColor } from "@/utils";
import { isAbsolute } from "path";

const { Sider } = Layout;
const { Text } = Typography;

interface LeftSiderProps {
    onSelect: (orderId: number) => void;
    defaultSelected?: number | null;
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    collapsedWidth?: number;
    breakpoint?: Breakpoint;
    style?: React.CSSProperties;
    orders: Order[];
    loading: boolean;
}

export default function LeftSider({
    onSelect,
    defaultSelected,
    collapsed = false,
    onCollapse,
    collapsedWidth = 70,
    breakpoint,
    style,
    orders,
    loading,
}: LeftSiderProps) {
    const { token } = theme.useToken();
    const { mode } = useDarkMode();

    const handleToggle = () => {
        if (onCollapse) onCollapse(!collapsed);
    };

    const menuItems = orders.map((order) => ({
        key: order.id.toString(),
        label: collapsed ? (
            // Khi sider đóng: chỉ hiển thị ID
            <Text>{order.id}</Text>
        ) : (
            // Khi mở: hiển thị đầy đủ thông tin
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Text strong>{`Order #${order.id}`}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    <Tag style={{ marginBottom: 5 }} color={getStatusColor(order.status)}>{order.status.toUpperCase()}</Tag>{`• ${dayjs(order.created_at).format("DD-MM-YYYY HH:mm")}`}
                </Text>
            </div>
        ),
        title: `Order #${order.id} (${order.status.toUpperCase()})`,
        style: { marginBottom: 5, paddingTop: 5, paddingBottom: 5 },
    }));

    console.log(menuItems);

    return (
        <Sider
            theme={mode}
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={220}
            collapsedWidth={collapsedWidth}
            breakpoint={breakpoint}
            onBreakpoint={(broken) => {
                if (onCollapse) onCollapse(broken);
            }}
            style={{
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
                overflowY: "visible",
                transition: "all 0.3s ease",
                overflowX: "hidden",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: !collapsed ? "space-between" : "center",
                    padding: "12px 12px",
                    position: "relative",
                }}
            >
                {/* Tiêu đề căn giữa khi mở */}
                {!collapsed && (
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontWeight: 500,
                            fontSize: 16,
                        }}
                        className="font-medium text-lg"
                    >
                        <span>Orders</span>
                    </div>
                )}

                {/* Nút toggle */}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={handleToggle}
                    style={{
                        color: token.colorText,
                        ...(collapsed ? {} : { marginLeft: "auto" }), // ✅ chỉ thêm margin khi mở
                    }}
                />
            </div>

            <Divider style={{ margin: 4 }}></Divider>



            {/* Nội dung menu */}
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <Spin />
                </div>
            ) : (

                <Menu
                    theme={mode}
                    mode="inline"
                    items={menuItems}
                    onClick={({ key }) => onSelect(Number(key))}
                    defaultSelectedKeys={defaultSelected ? [defaultSelected.toString()] : []}
                    style={{
                        borderRight: 0,
                    }}
                />
            )}
        </Sider>
    );
}