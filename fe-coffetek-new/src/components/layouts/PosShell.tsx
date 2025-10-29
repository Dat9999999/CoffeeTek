"use client";
import { Layout, Menu, Space, theme, Typography } from "antd";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AvatarMenuPos } from "../commons";
import { useDarkMode } from "@/components/providers";
import {
    ShopOutlined,
    SyncOutlined,
    OrderedListOutlined,
} from "@ant-design/icons"; // 👈 import icon ở đây
const { Title, Text } = Typography;
const { Header, Content } = Layout;

export function PosShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const {
        token: { colorBgContainer, colorPrimary, colorBorderSecondary, borderRadiusLG },
    } = theme.useToken();
    const { mode } = useDarkMode();

    const items1 = [
        // {
        //     key: "/pos",
        //     label: "POS",
        //     icon: <ShopOutlined />,
        // },
        {
            key: "/pos/orders-processing",
            label: "Processing Orders",
            icon: <SyncOutlined />,
        },
        {
            key: "/pos/all-orders",
            label: "All Orders",
            icon: <OrderedListOutlined />,
        },
    ];

    return (
        <Layout>
            <Header
                style={{
                    padding: "0 16px",
                    background: colorBgContainer,
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
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <Title
                        onClick={() => router.push("/pos")}
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
                            <ShopOutlined />
                            <span>POS</span>
                        </Space>
                    </Title>

                    <Menu
                        className="custom-menu"
                        theme={mode}
                        mode="horizontal"
                        selectedKeys={[pathname]}
                        items={items1}
                        onClick={(info) => router.push(`${info.key}`)}
                        style={{
                            borderBottom: "none",
                        }}
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
            // .custom-menu.ant-menu-horizontal > .ant-menu-item-selected {
            //     background-color: ${colorPrimary} !important;
            //     color: white !important;
            //     transition: all 0.3s ease;
            // }

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
