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
import { AuditOutlined, DeleteOutlined, ExperimentOutlined, FallOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { Order } from "@/interfaces";
import dayjs from "dayjs";
import { useDarkMode } from "@/components/providers";
import { getStatusColor } from "@/utils";
import { ProcessOrderCountDisplay } from "@/components/features/pos";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;
const { Text } = Typography;

interface LeftSiderProps {
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    collapsedWidth?: number;
    breakpoint?: Breakpoint;
    style?: React.CSSProperties;
}

export default function LeftSider({

    collapsed = false,
    onCollapse,
    collapsedWidth = 70,
    breakpoint,
    style,

}: LeftSiderProps) {
    const { token } = theme.useToken();
    const { mode } = useDarkMode();

    const handleToggle = () => {
        if (onCollapse) onCollapse(!collapsed);
    };

    const pathname = usePathname();
    const selectedKey = pathname?.split("/").pop() || "materials";



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

                        <Link href="/pos/inventory">   Inventory</Link>
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

            <Divider style={{ margin: 2 }}></Divider>
            <Menu
                theme={mode}
                mode="inline"
                selectedKeys={[selectedKey]}
                items={[
                    {
                        key: "inventory",
                        icon: <ExperimentOutlined />,
                        label: <Link href="/pos/inventory">Material List</Link>,
                    },
                    {
                        key: "wastage-log",
                        icon: <FallOutlined />,
                        label: <Link href="/pos/inventory/wastage-log">Wastage Log</Link>,
                    },
                    {
                        key: "inventory-checking",
                        icon: <AuditOutlined />,
                        label: <Link href="/pos/inventory/inventory-checking">Inventory Checking</Link>,
                    },
                ]}
            />

        </Sider>
    );
}