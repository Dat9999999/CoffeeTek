"use client";

import React from "react";
import {
    Layout,
    Menu,
    Spin,
    theme,
    Typography,
    Button,
    Divider,
    type Breakpoint,
    Tag,
    Empty,
} from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { Order } from "@/interfaces";
import dayjs from "dayjs";
import { useDarkMode } from "@/components/providers";
import { getStatusColor } from "@/utils";
import { ProcessOrderCountDisplay } from "@/components/features/pos";
import Link from "next/link";

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
    fetchOrders: () => void;
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
    fetchOrders,
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
                    <Tag
                        style={{ marginBottom: 5 }}
                        color={getStatusColor(order.status)}
                    >
                        {order.status.toUpperCase()}
                    </Tag>
                    {`• ${dayjs(order.created_at).format("DD-MM-YYYY HH:mm")}`}
                </Text>
            </div>
        ),
        title: `Order #${order.id} (${order.status.toUpperCase()})`,
        style: {
            marginBottom: 1,
            paddingTop: 24,  // <-- Tăng giá trị này
            paddingBottom: 24 // <-- Tăng giá trị này
        },
    }));

    // console.log(menuItems); // Bạn có thể xoá dòng này nếu không cần

    /**
     * Định nghĩa nội dung Sider dựa trên trạng thái
     */
    const renderSiderContent = () => {
        // 1. Trạng thái Đang tải
        if (loading) {
            return (
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
            );
        }

        // 2. Trạng thái Trống (Tải xong, không có dữ liệu)
        if (!loading && orders.length === 0) {
            return (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        boxSizing: "border-box",
                        overflowY: "hidden"
                    }}
                >
                    {/* Chỉ hiển thị text khi Sider đang mở */}
                    {!collapsed && (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            styles={{ image: { height: 60 } }}
                            description={
                                <Typography.Text>
                                    No orders
                                </Typography.Text>
                            }
                        >
                            <Link href={"/pos"}><Button type="primary">Create Now</Button></Link>
                        </Empty>
                    )}
                </div>
            );
        }

        // 3. Trạng thái có dữ liệu
        return (
            <Menu
                theme={mode}
                mode="inline"
                items={menuItems}
                onClick={({ key }) => onSelect(Number(key))}
                defaultSelectedKeys={
                    defaultSelected ? [defaultSelected.toString()] : []
                }
                style={{
                    borderRight: 0,
                }}
            />
        );
    };

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
                        <ProcessOrderCountDisplay onCountUpdate={fetchOrders} />
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
                        ...(collapsed ? {} : { marginLeft: "auto" }),
                    }}
                />
            </div>

            <Divider style={{ margin: 4 }}></Divider>

            {/* Nội dung menu (đã tách ra logic) */}
            {renderSiderContent()}
        </Sider>
    );
}