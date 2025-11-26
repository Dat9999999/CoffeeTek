// utils/notificationUtils.tsx
import React from 'react';
import {
    ShoppingCartOutlined,
    SoundOutlined,
    AppstoreOutlined,
    CarryOutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { NotificationType } from "@/interfaces";
import { Bell, CalendarCheck, Megaphone, Package, ShoppingCart } from 'lucide-react';

// 1. Helper lấy Icon
export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.ORDER:
            return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;

        case NotificationType.PROMOTION:
            return <SoundOutlined style={{ color: '#faad14' }} />;

        case NotificationType.INVENTORY:
            return <AppstoreOutlined style={{ color: '#722ed1' }} />;

        case NotificationType.ORDER_TASK:
            return <CarryOutOutlined style={{ color: '#13c2c2' }} />;

        case NotificationType.SYSTEM:
        default:
            return <BellOutlined style={{ color: '#52c41a' }} />;
    }
};

// 2. Cấu hình Tabs
export const NOTIFICATION_TAB_ITEMS = [
    { key: 'all', label: 'All' },
    { key: NotificationType.ORDER_TASK, label: 'Order Task' },
    { key: NotificationType.ORDER, label: 'Order' },
    { key: NotificationType.PROMOTION, label: 'Promo' },
    { key: NotificationType.INVENTORY, label: 'Stock' },
    { key: NotificationType.SYSTEM, label: 'System' },
];


// 2. Cấu hình Tabs cho Home page customer
export const NOTIFICATION_TAB_ITEMS_CUSTOMER = [
    { key: 'all', label: 'All' },
    { key: NotificationType.ORDER, label: 'Order' },
    { key: NotificationType.PROMOTION, label: 'Promo' },
    { key: NotificationType.SYSTEM, label: 'System' },
];


export const getLucideIcon = (type: string) => {
    switch (type) {
        case NotificationType.ORDER: return <ShoppingCart className="h-4 w-4 text-blue-500" />;
        case NotificationType.PROMOTION: return <Megaphone className="h-4 w-4 text-orange-500" />;
        case NotificationType.SYSTEM: return <CalendarCheck className="h-4 w-4 text-cyan-500" />;
        default: return <Bell className="h-4 w-4 text-green-500" />;
    }
};