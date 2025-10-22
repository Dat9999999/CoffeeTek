"use client";
import { Layout, Menu, theme } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    AppstoreOutlined,
    TagsOutlined,
    DatabaseOutlined,
    SettingOutlined,
    ShoppingOutlined,
    InboxOutlined,
    BarsOutlined,
    ControlOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminDarkModeSwitch } from "@/components/commons";
import { useDarkMode } from "@/components/providers";

const { Header, Content, Footer, Sider } = Layout;

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG, colorBorderSecondary },
    } = theme.useToken();
    const { mode } = useDarkMode();

    const items = [
        { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
        {
            key: "products",
            icon: <ShoppingOutlined />,
            label: "Products",
            children: [
                { key: "/admin/products", icon: <AppstoreOutlined />, label: "Product" },
                { key: "/admin/categories", icon: <TagsOutlined />, label: "Category" },
                { key: "/admin/sizes", icon: <DatabaseOutlined />, label: "Size" },
                { key: "/admin/toppings", icon: <AppstoreOutlined />, label: "Topping" },
                { key: "/admin/option-groups", icon: <ControlOutlined />, label: "Option group" },

            ],
        },
        {
            key: "inventory",
            icon: <InboxOutlined />,
            label: "Inventory",
            children: [
                { key: "/admin/materials", icon: <DatabaseOutlined />, label: "Material" },
                { key: "/admin/recipes", icon: <SettingOutlined />, label: "Recipe" },
            ],
        },


    ];

    return (
        <Layout>
            <Sider theme={mode} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <Menu
                    theme={mode}
                    mode="inline"
                    items={items}
                    selectedKeys={[pathname]}
                    onClick={({ key }) => {
                        if (key.startsWith("/admin")) router.push(key);
                    }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        border: `1px solid ${colorBorderSecondary}`,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        // position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}>
                    <AdminDarkModeSwitch />
                </Header>

                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: "calc(100vh - 100px)",
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
