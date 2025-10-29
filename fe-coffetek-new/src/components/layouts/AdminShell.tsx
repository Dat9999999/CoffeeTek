"use client";
import { Button, Flex, Layout, Menu, theme, Typography } from "antd";
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
    ExperimentOutlined,
    SlidersOutlined,
    MenuOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CrownOutlined,
    GiftOutlined,
    CreditCardOutlined,
    IdcardOutlined,
    SolutionOutlined,
    ContainerOutlined,
    ReconciliationOutlined,
    FileSyncOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDarkMode } from "@/components/providers";
import { AvatarMenu } from "../commons/AvatarMenu";
const { Title } = Typography;
const { Header, Content, Footer, Sider } = Layout;

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG, colorBorderSecondary, colorPrimary },
    } = theme.useToken();
    const { mode } = useDarkMode();

    const items = [
        { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "/admin/users", icon: <UserOutlined />, label: "Users" },
        { key: "/admin/orders", icon: <ReconciliationOutlined />, label: "Orders" },
        {
            key: "customers",
            icon: <SolutionOutlined />,
            label: "Customers",
            children: [
                { key: "/admin/loyal-levels", icon: <CrownOutlined />, label: "Loyal Levels" },
                { key: "/admin/promotions", icon: <GiftOutlined />, label: "Promotions" },
                { key: "/admin/vouchers", icon: <IdcardOutlined />, label: "Vouchers" },
            ],
        },
        {
            key: "products",
            icon: <ShoppingOutlined />,
            label: "Products",
            children: [
                { key: "/admin/products", icon: <ShoppingOutlined />, label: "Product" },
                { key: "/admin/categories", icon: <TagsOutlined />, label: "Category" },
                { key: "/admin/sizes", icon: <SlidersOutlined />, label: "Size" },
                { key: "/admin/option-groups", icon: <ControlOutlined />, label: "Option group" },

            ],
        },
        {
            key: "inventory",
            icon: <DatabaseOutlined />,
            label: "Inventory",
            children: [
                { key: "/admin/materials", icon: <ExperimentOutlined />, label: "Material" },
                { key: "/admin/materials/confirm-changes", icon: <FileSyncOutlined />, label: "Confirm changes" },

            ],

        },


    ];

    const allKeys = items.flatMap(item =>
        item.children ? item.children.map(child => child.key) : [item.key]
    );

    const selectedKey = allKeys.find(k => pathname.startsWith(k)) ?? "";

    return (
        <Layout>
            <div>
                <Sider
                    theme={mode}
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    breakpoint="lg"
                    collapsedWidth="0"
                    // onBreakpoint={(broken) => setCollapsed(broken)}
                    trigger={null}
                    style={{
                        position: window.innerWidth < 992 ? "fixed" : "relative",
                        zIndex: 1000,
                        height: "100%",
                        transition: "all 0.1s",
                    }}
                >
                    <Flex
                        align="center"
                        style={{ position: "relative", height: 55, padding: "0 16px" }}
                    >
                        {/* Title ở giữa */}
                        <Title
                            className="cursor-pointer"
                            onClick={() => router.push("/admin/dashboard")}
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
                                opacity: collapsed ? 0 : 1, // ẩn text khi collapsed
                            }}
                        >
                            ShopControl
                        </Title>

                        {/* Button toggle ở bên phải */}
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



                    <Menu
                        theme={mode}
                        mode="inline"
                        items={items}
                        selectedKeys={[selectedKey]}
                        onClick={({ key }) => {
                            if (key.startsWith("/admin")) router.push(key);
                            if (window.innerWidth < 992) setCollapsed(true);
                        }}
                    />
                </Sider>
            </div>



            <Layout>
                <Header
                    style={{
                        padding: "0 8px 0 0",
                        background: colorBgContainer,
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
