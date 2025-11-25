"use client";

import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, Dropdown, MenuProps, Modal, Space, Spin, Typography } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ShopOutlined,
    ProfileOutlined,
    HomeOutlined,
    CaretDownOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';
import { useAuthContext } from '@/contexts/AuthContext'; // Đảm bảo import đúng
import { authService } from '@/services';
import { NotificationBellAndBadge } from './notification';

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

    const menuItems: MenuProps['items'] = [
        // ... (Giữ nguyên menuItems của bạn) ...
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
        // {
        //     key: 'theme',
        //     label: (
        //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        //             <AdminDarkModeToggleMini />
        //         </div>
        //     ),
        // },
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
        <div
            style={{
                display: 'flex',
                alignItems: 'center',   // 💥 fix lệch dọc
                gap: '8px',            // thay Space
            }}
        >
            {/* User Name */}
            <span
                style={{
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    height: '30px',       // đảm bảo chiều cao đều nhau
                }}
            >
                {user?.first_name} {user?.last_name}
            </span>

            {/* Notification Badge */}
            <div style={{ height: "30px", display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                <NotificationBellAndBadge />
            </div>

            {/* Avatar Dropdown */}
            <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "30px",
                        cursor: 'pointer',
                    }}
                >
                    <Avatar
                        className='mr-1'
                        size={32}
                        icon={<UserOutlined />}
                    />
                    <CaretDownOutlined style={{ color: "#bfbfbf" }} />
                </div>
            </Dropdown>
        </div>
    );

};