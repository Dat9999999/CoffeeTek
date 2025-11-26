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
    CaretDownOutlined,
} from '@ant-design/icons';
import { AdminDarkModeToggleMini } from './AdminDarkModeSwitch';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services';
import { NotificationBellAndBadge } from './notification';

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
        // {
        //     key: 'theme',
        //     label: (
        //         <div
        //             style={{
        //                 display: 'flex',
        //                 justifyContent: 'space-between',
        //                 alignItems: 'center',
        //             }}
        //         >
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
