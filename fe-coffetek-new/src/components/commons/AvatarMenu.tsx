'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, Dropdown, MenuProps, Typography } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ShopOutlined,
    ProfileOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';

const { Text } = Typography;

export const AvatarMenu: React.FC = () => {
    const menuItems: MenuProps['items'] = [
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
            <Badge dot={true} color="green" offset={[-1, 38]}>
                <Avatar
                    style={{ cursor: 'pointer' }}
                    size="default"
                    icon={<UserOutlined />}
                />
            </Badge>
        </Dropdown>
    );
};
