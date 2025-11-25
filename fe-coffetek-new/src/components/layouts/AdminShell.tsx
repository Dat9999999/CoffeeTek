"use client";

import { Button, Flex, Layout, Menu, theme, Typography } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    TagsOutlined,
    DatabaseOutlined,
    ShoppingOutlined,
    ControlOutlined,
    ExperimentOutlined,
    SlidersOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CrownOutlined,
    GiftOutlined,
    IdcardOutlined,
    SolutionOutlined,
    ReconciliationOutlined,
    AuditOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/components/providers";
import { AvatarMenu } from "../commons/AvatarMenu";

const { Title } = Typography;
const { Header, Content, Footer, Sider } = Layout;

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG, colorBorderSecondary, colorPrimary, colorBgBase },
    } = theme.useToken();
    const { mode } = useDarkMode();

    // ✅ Dùng Link thật để trình duyệt hiểu là liên kết
    const items = [
        {
            key: "/admin/dashboard",
            icon: <DashboardOutlined />,
            label: <Link href="/admin/dashboard">Dashboard</Link>,
        },
        {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Users</Link>,
        },
        {
            key: "/admin/orders",
            icon: <ReconciliationOutlined />,
            label: <Link href="/admin/orders">Orders</Link>,
        },
        {
            key: "customers",
            icon: <SolutionOutlined />,
            label: "Customers",
            children: [
                {
                    key: "/admin/loyal-levels",
                    icon: <CrownOutlined />,
                    label: <Link href="/admin/loyal-levels">Loyal Levels</Link>,
                },
                {
                    key: "/admin/promotions",
                    icon: <GiftOutlined />,
                    label: <Link href="/admin/promotions">Promotions</Link>,
                },
                {
                    key: "/admin/vouchers",
                    icon: <IdcardOutlined />,
                    label: <Link href="/admin/vouchers">Vouchers</Link>,
                },
            ],
        },
        {
            key: "products",
            icon: <ShoppingOutlined />,
            label: "Products",
            children: [
                {
                    key: "/admin/products",
                    icon: <ShoppingOutlined />,
                    label: <Link href="/admin/products">Product</Link>,
                },
                {
                    key: "/admin/categories",
                    icon: <TagsOutlined />,
                    label: <Link href="/admin/categories">Category</Link>,
                },
                {
                    key: "/admin/sizes",
                    icon: <SlidersOutlined />,
                    label: <Link href="/admin/sizes">Size</Link>,
                },
                {
                    key: "/admin/option-groups",
                    icon: <ControlOutlined />,
                    label: <Link href="/admin/option-groups">Option Group</Link>,
                },
            ],
        },
        {
            key: "inventory",
            icon: <DatabaseOutlined />,
            label: "Inventory",
            children: [
                {
                    key: "/admin/materials",
                    icon: <ExperimentOutlined />,
                    label: <Link href="/admin/materials">Material</Link>,
                },
                {
                    key: "/admin/inventory-checking",
                    icon: <AuditOutlined />,
                    label: <Link href="/admin/inventory-checking">Inventory Checking</Link>,
                },
            ],
        },
    ];

    const allKeys = items.flatMap((item) =>
        item.children ? item.children.map((child) => child.key) : [item.key]
    );
    const selectedKey = allKeys.find((k) => pathname.startsWith(k)) ?? "";

    return (
        <Layout >
            <Sider
                theme={mode}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg"
                collapsedWidth="0"
                trigger={null}
                style={{
                    position: typeof window !== "undefined" && window.innerWidth < 992 ? "fixed" : "relative",
                    zIndex: 1000,
                    minHeight: "100%",
                    transition: "all 0.1s",
                    background: colorBgBase
                }}
            >
                {/* Header của sidebar */}
                <Flex
                    align="center"
                    style={{ position: "relative", height: 55, padding: "0 16px" }}
                >
                    <Title
                        className="cursor-pointer"
                        level={4}
                        style={{
                            color: colorPrimary,
                            fontWeight: 700,
                            margin: 0,
                            textAlign: "center",
                            width: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            transition: "opacity 0.2s",
                            opacity: collapsed ? 0 : 1,
                        }}
                    >
                        <Link href="/admin/dashboard">ShopControl</Link>
                    </Title>

                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                        }}
                    />
                </Flex>

                {/* Menu chính */}
                <Menu
                    theme={mode}
                    mode="inline"
                    items={items}
                    selectedKeys={[selectedKey]}
                    onClick={() => {
                        if (window.innerWidth < 992) setCollapsed(true);
                    }}
                />
            </Sider>

            {/* Layout chính */}
            <Layout>
                <Header
                    style={{
                        background: colorBgBase,

                        padding: "0 4px 0 0",
                        borderBottom: `1px solid ${colorBorderSecondary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 55,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <div>
                        {collapsed && (
                            <div style={{ padding: "8px", textAlign: "right" }}>
                                <Button
                                    type="text"
                                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                    onClick={() => setCollapsed(!collapsed)}
                                />
                            </div>
                        )}
                    </div>
                    <Flex justify="end" align="center">

                        <AvatarMenu />
                    </Flex>
                </Header>

                <Content
                    style={{
                        margin: 12,
                        padding: 12,
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
