'use client';

import React from 'react';
import { Avatar, Dropdown, Menu, Space, Typography } from 'antd';
import { UserOutlined, HomeOutlined, LogoutOutlined, SettingOutlined, DownOutlined, CaretDownOutlined, ShopOutlined, ProfileOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';

const { Text } = Typography;

export const AvatarMenu: React.FC = () => {
    const router = useRouter();

    const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'pos':
                router.push('/pos');
                break;
            case 'profile':
                router.push('/profile');
                break;
            case 'logout':
                // Xử lý logout (xóa token, redirect, v.v.)
                // localStorage.removeItem('token');
                router.push('/login');
                break;
            default:
                break;
        }
    };

    const menu = (
        <Menu
            onClick={handleMenuClick}
            items={[
                {
                    key: 'pos',
                    label: 'POS page',
                    icon: <ShopOutlined />,
                },
                {
                    key: 'profile',
                    label: 'Profile',
                    icon: <ProfileOutlined />,
                },
                {
                    type: 'divider',
                },
                {
                    key: 'theme',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <AdminDarkModeToggleMini />
                        </div>
                    ),
                },
                {
                    type: 'divider',
                },
                {
                    key: 'logout',
                    label: <Text >Logout</Text>,
                    icon: <LogoutOutlined />,
                },
            ]}
        />
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
                <Avatar size="large" icon={<UserOutlined />} />
                <CaretDownOutlined />
            </Space>
        </Dropdown>
    );
};

