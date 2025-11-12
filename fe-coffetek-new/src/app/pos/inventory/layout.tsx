"use client";

import { NewOrderNotifier } from "@/components/listeners";
import { ReactNode, useState } from "react";
import { Layout, theme, Button } from "antd";
import { useDarkMode } from "@/components/providers";
import LeftSider from "./LeftSider";
import { MenuUnfoldOutlined } from "@ant-design/icons";
const { Sider, Content } = Layout;

export default function PosInventoryLayout({ children }: { children: ReactNode }) {
    const { token } = theme.useToken();
    const { mode } = useDarkMode(); // Not directly used here, but kept for consistency
    const [collapsed, setCollapsed] = useState(typeof window !== "undefined" && window.innerWidth < 992);
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 992);


    return (
        <>
            <Layout style={{ minHeight: "100vh", position: "relative" }}>
                <LeftSider
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    collapsedWidth={isMobile ? 0 : 70}
                    style={{
                        position: isMobile ? "fixed" : undefined,
                        left: isMobile ? 0 : undefined,
                        top: isMobile ? 0 : undefined,
                        height: isMobile ? "100vh" : undefined,
                        zIndex: isMobile ? 1000 : undefined,
                    }}

                />
                <Layout style={{ width: "100%" }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 300,
                            background: token.colorBgContainer,
                            borderRadius: token.borderRadiusLG,
                        }}
                    >
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuUnfoldOutlined />}
                                onClick={() => setCollapsed(false)}
                                style={{ marginBottom: 16 }}
                            >

                            </Button>
                        )}
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </>

    );
}


