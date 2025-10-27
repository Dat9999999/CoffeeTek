'use client';

import React from 'react';
import { Avatar, Badge, Dropdown, Menu, Space, theme, Typography } from 'antd';
import { UserOutlined, HomeOutlined, LogoutOutlined, SettingOutlined, DownOutlined, CaretDownOutlined, ShopOutlined, ProfileOutlined, DashboardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';

const { Text } = Typography;

export const AvatarMenuPos: React.FC = () => {
    const router = useRouter();
    const { token } = theme.useToken();
    const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'admin':
                router.push('/admin/dashboard');
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
                    key: 'admin',
                    label: 'Shop control',
                    icon: <DashboardOutlined />,
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
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" >
            <Badge dot={true} color='green' offset={[-1, 38]}>
                <Avatar style={{ cursor: 'pointer' }} size="default" icon={<UserOutlined />} />
                {/* <CaretDownOutlined style={{ color: token.colorPrimary }} /> */}
            </Badge>
        </Dropdown>
    );
};

