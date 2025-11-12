"use client";

import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, Dropdown, MenuProps, Modal, Spin, Typography } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ShopOutlined,
    ProfileOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services';

const { Text } = Typography;

export const AvatarMenu: React.FC = () => {
    const { user, loading, setUser, setIsAuthenticated } = useAuthContext();
    if (loading) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <Spin size="default" />
            </div>
        );
    }
    if (!user) return null;

    const menuItems: MenuProps['items'] = user ? [
        {
            key: 'pos',
            label: <Link href="/pos">POS page</Link>,
            icon: <ShopOutlined />,
        },
        {
            key: 'profile',
            label: <Link href="/profile">Profile</Link>,
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

    ] : [];

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
