"use client";

import { Layout, Menu, Space, theme, Typography } from "antd";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarMenuPos } from "../commons";
import { useDarkMode } from "@/components/providers";
import {
    ShopOutlined,
} from "@ant-design/icons";
import { BadgeProcessOrderCountDisplay } from "../features/pos/socket-io/BadgeProcessOrderCountDisplay";

const { Title } = Typography;
const { Header, Content } = Layout;

export function PosShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const {
        token: { colorBgContainer, colorPrimary, colorBorderSecondary, borderRadiusLG, colorBorderBg, colorPrimaryBorder, colorBgBase },
    } = theme.useToken();
    const { mode } = useDarkMode();

    const items1 = [
        {
            key: "/pos/orders-processing",
            label:
                <BadgeProcessOrderCountDisplay>
                    <Link href="/pos/orders-processing">Processing Orders</Link>
                </BadgeProcessOrderCountDisplay>,
            style: { padding: 1 }
        },
        {
            key: "/pos/all-orders",
            label: <Link href="/pos/all-orders">All Orders</Link>,
            style: { padding: 1 }

        },
        {
            key: "/pos/inventory",
            label: <Link href="/pos/inventory">Inventory</Link>,
        },
    ];

    return (
        <Layout>
            <Header
                style={{
                    background: colorBgBase,
                    padding: "3px 16px",
                    borderBottom: `1px solid ${colorBorderSecondary}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 55,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    zIndex: 10,
                }}
            >
                {/* 👇 Nhóm Title + Menu chung 1 cụm */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Title
                        level={2}
                        style={{
                            fontWeight: 600,
                            color: colorPrimary,
                            cursor: "pointer",
                            margin: 0,
                            lineHeight: "55px",
                        }}
                    >
                        <Space>
                            <Link href="/pos" style={{ color: colorPrimary, textDecoration: "none" }}>
                                <span>POS</span>
                            </Link>
                        </Space>
                    </Title>

                    <Menu

                        className="custom-menu"
                        theme={mode}
                        mode="horizontal"
                        selectedKeys={[items1.find(item => pathname.startsWith(item.key))?.key || ""]}
                        items={items1}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </div>

                {/* 👈 Avatar nằm bên phải */}
                <AvatarMenuPos />
            </Header>

            <Layout>
                <Content
                    style={{
                        padding: 0,
                        margin: 0,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>

            {/* 👇 custom style cho item được chọn */}
            <style jsx global>{`
                .custom-menu.ant-menu-horizontal > .ant-menu-item:hover {
                    background-color: rgba(0, 0, 0, 0.04);
                }

                .custom-menu.ant-menu-horizontal > .ant-menu-item {
                    min-width: 100px;
                    text-align: center;
                    justify-content: center;
                }
            `}</style>
        </Layout>
    );
}
