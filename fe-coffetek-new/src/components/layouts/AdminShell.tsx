"use client";
import { Layout, Menu, Breadcrumb, theme } from "antd";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminDarkModeSwitch } from "@/components/commons";
import { useDarkMode } from "@/components/providers";

const { Header, Content, Footer, Sider } = Layout;



export function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { mode, toggleMode } = useDarkMode();
    const items = [
        { key: "/admin/dashboard", icon: <PieChartOutlined />, label: "Dashboard" },
        { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
        { key: "/admin/sizes", icon: <DesktopOutlined />, label: "Size" },
        { key: "/admin/toppings", icon: <FileOutlined />, label: "Topping" },
        { key: "/admin/categories", icon: <FileOutlined />, label: "Category" },
        { key: "/admin/option-groups", icon: <FileOutlined />, label: "Option group" },
        { key: "/admin/products", icon: <FileOutlined />, label: "Product" },

    ];

    const pathname = usePathname();
    return (
        <Layout  >
            <Sider theme={mode} collapsible collapsed={collapsed} onCollapse={setCollapsed} >
                <div className="demo-logo-vertical" />
                <Menu
                    theme={mode}
                    defaultSelectedKeys={["/admin/dashboard"]}
                    mode="inline"
                    items={items}
                    onClick={({ key }) => router.push(key)}
                    selectedKeys={[pathname]}
                />
            </Sider>

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} > <AdminDarkModeSwitch /> </Header>
                {/* <Content style={{ margin: "0 16px" }}>
                    <Breadcrumb style={{ margin: "16px 0" }} items={[{ title: "Admin" }]} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content> */}

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 'calc(100vh - 16px)',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,

                    }}
                >
                    {children}
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Admin Dashboard ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
}
