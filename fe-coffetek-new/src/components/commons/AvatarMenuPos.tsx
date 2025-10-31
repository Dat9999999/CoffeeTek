'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, Dropdown, MenuProps, Typography, theme } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';

const { Text } = Typography;

export const AvatarMenuPos: React.FC = () => {
    const { token } = theme.useToken();

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
            label: (
                <Link href="/login" style={{ color: 'inherit' }}>
                    <Text>Logout</Text>
                </Link>
            ),
            icon: <LogoutOutlined />,
        },
    ];

    return (
        <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
        >
            <Badge dot color="green" offset={[-1, 38]}>
                <Avatar
                    style={{ cursor: 'pointer' }}
                    size="default"
                    icon={<UserOutlined />}
                />
            </Badge>
        </Dropdown>
    );
};
