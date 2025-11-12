'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, Dropdown, MenuProps, Modal, Spin, Typography, theme } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    DashboardOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services';

const { Text } = Typography;

export const AvatarMenuPos: React.FC = () => {
    const { token } = theme.useToken();

    const { user, loading, setUser, setIsAuthenticated } = useAuthContext();
    if (loading) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <Spin size="default" />
            </div>
        );
    }
    if (!user) return null;

    // ✅ Dùng kiểu an toàn của Ant Design
    const menuItems: MenuProps['items'] = [
        {
            key: 'admin',
            label: (
                <Link href="/admin/dashboard" style={{ color: 'inherit' }}>
                    Shop control
                </Link>
            ),
            icon: <DashboardOutlined />,
        },
        {
            key: 'profile',
            label: (
                <Link href="/profile" style={{ color: 'inherit' }}>
                    Profile
                </Link>
            ),
            icon: <ProfileOutlined />,
        },
        {
            key: 'homepage',
            label: <Link href="/">Home page</Link>,
            icon: <HomeOutlined />,
        },
        { type: 'divider' as const },
        {
            key: 'theme',
            label: (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <AdminDarkModeToggleMini />
                </div>
            ),
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            label: <Text style={{ cursor: 'pointer' }}>Logout</Text>,
            icon: <LogoutOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: 'Confirm Logout',
                    content: 'Are you sure you want to logout?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => authService.logout(setUser, setIsAuthenticated),
                });
            },
        }
    ];

    return (
        <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
        >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span>{user?.first_name} {user?.last_name}</span>
                <Badge dot={true} color="green" offset={[-1, 38]}>
                    <Avatar
                        style={{ cursor: 'pointer' }}
                        size="default"
                        icon={<UserOutlined />}
                    />
                </Badge>
            </div>
        </Dropdown>
    );
};
