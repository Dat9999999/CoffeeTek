"use client";

import React, { useEffect, useState } from 'react';
import {
    List,
    Avatar,
    Button,
    Spin,
    Typography,
    Select,
    Tabs,
    Empty,
    message,
    Space,
    Tooltip,
    theme
} from 'antd';
import {
    BellOutlined,
    ShoppingCartOutlined,
    SoundOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CarryOutOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationType } from '@/interfaces'; // Đảm bảo đúng đường dẫn file type
import { getNotificationIcon, NOTIFICATION_TAB_ITEMS } from '@/utils';

dayjs.extend(relativeTime);
const { Text } = Typography;

interface NotificationPopoverProps {
    onMarkAsReadSuccess?: () => void;
    refreshKey?: number; // Prop nhận tín hiệu reload từ cha
}

export const NotificationPopoverContent: React.FC<NotificationPopoverProps> = ({
    onMarkAsReadSuccess,
    refreshKey = 0
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const { token } = theme.useToken();

    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filterType, setFilterType] = useState<string | undefined>(undefined);
    const [filterIsRead, setFilterIsRead] = useState<string>('all'); // 'all' | 'read' | 'unread'

    // Helper: Lấy params lọc
    const getFilterParams = () => {
        let isReadParam: boolean | undefined = undefined;
        if (filterIsRead === 'read') isReadParam = true;
        if (filterIsRead === 'unread') isReadParam = false;
        return isReadParam;
    }

    // --- LOGIC 1: Fetch data chính (Dùng cho lần đầu, Filter, Load More) ---
    const fetchNotifications = async (currentPage: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const isReadParam = getFilterParams();

            const res = await notificationService.getAll(
                currentPage,
                5,
                filterType,
                isReadParam
            );

            if (isLoadMore) {
                // FIX PAGINATION DRIFT: Lọc trùng lặp trước khi merge
                setNotifications((prev) => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const uniqueNewItems = res.data.filter(item => !existingIds.has(item.id));
                    return [...prev, ...uniqueNewItems]; // Nối vào đuôi
                });
            } else {
                setNotifications(res.data);
            }

            // Kiểm tra xem còn trang sau không
            if (res.data.length < 5) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // --- LOGIC 2: Silent Update (Dùng cho Socket - Realtime) ---
    // Chỉ lấy tin mới nhất ở trang 1 và chèn vào đầu, không reset trang đang xem
    const fetchNewAndMerge = async () => {
        try {
            const isReadParam = getFilterParams();
            // Luôn gọi trang 1 để lấy tin mới nhất
            const res = await notificationService.getAll(1, 5, filterType, isReadParam);

            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const newItems = res.data.filter(n => !existingIds.has(n.id));

                if (newItems.length === 0) return prev;
                return [...newItems, ...prev]; // Chèn vào đầu
            });
        } catch (error) {
            console.error("Silent update failed", error);
        }
    };

    // Effect 1: Lắng nghe Socket reload
    useEffect(() => {
        if (refreshKey > 0) {
            fetchNewAndMerge();
        }
    }, [refreshKey]);

    // Effect 2: Reload khi đổi filter (Reset về trang 1)
    useEffect(() => {
        setPage(1);
        fetchNotifications(1, false);
    }, [filterType, filterIsRead]);

    // Action: Load More
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    // Action: Mark 1 as Read
    const handleMarkAsRead = async (item: Notification) => {
        if (item.isRead) return;
        try {
            // Optimistic Update
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            await notificationService.markAsRead(item.id);
            if (onMarkAsReadSuccess) onMarkAsReadSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    // Action: Mark All Read
    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            await notificationService.markAllAsRead();
            message.success('All marked as read');
            setPage(1);
            fetchNotifications(1, false);
            if (onMarkAsReadSuccess) onMarkAsReadSuccess();
        } catch (error) {
            message.error('Failed action');
        } finally {
            setLoading(false);
        }
    };

    // Icons Helper
    const getIconByType = getNotificationIcon;

    const tabItems = NOTIFICATION_TAB_ITEMS;

    return (
        <div style={{ width: 400, maxWidth: '75vw', padding: 0 }}>
            {/* --- HEADER --- */}
            <div style={{ padding: "0 16px", borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>Notifications</Text>
                    <Space align='center'>
                        <Select
                            value={filterIsRead}
                            onChange={setFilterIsRead}
                            size="small"
                            style={{ width: 90 }}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'unread', label: 'Unread' },
                                { value: 'read', label: 'Read' },
                            ]}
                        />
                        <Tooltip title="Mark all as read">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />}
                                onClick={handleMarkAllRead}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}
                            />
                        </Tooltip>
                    </Space>
                </div>
                <Tabs
                    activeKey={filterType || 'all'}
                    onChange={(key) => setFilterType(key === 'all' ? undefined : key)}
                    items={tabItems}
                    size="small"
                    tabBarStyle={{ marginBottom: 0 }}
                />
            </div>

            {/* --- LIST --- */}
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 0 }}>
                {loading && !loadingMore && notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '75px 0' }}><Spin /></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" /> }}
                        renderItem={(item) => (
                            <List.Item
                                className="notification-item"
                                style={{
                                    padding: '12px 16px', // Padding chuẩn để không dính lề
                                    cursor: item.isRead ? 'default' : 'pointer', // UX: Đã đọc thì chuột thường, chưa đọc thì pointer
                                    backgroundColor: item.isRead ? '#fff' : '#e6f7ff', // UI: Xanh nhạt cho tin chưa đọc
                                    transition: 'all 0.3s',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onClick={() => handleMarkAsRead(item)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            style={{ backgroundColor: item.isRead ? '#f5f5f5' : '#fff' }}
                                            icon={getIconByType(item.type)}
                                        />
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text strong={!item.isRead} style={{ fontSize: 13, flex: 1, marginRight: 8 }} ellipsis={{ tooltip: item.title }}>
                                                {item.title}
                                            </Text>
                                            {/* Dot Unread màu Xanh đậm */}
                                            {!item.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff', marginTop: 6, flexShrink: 0 }} />}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>{item.message}</div>
                                            <Text type="secondary" style={{ fontSize: 10 }}>{dayjs(item.createdAt).fromNow()}</Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>

            {/* --- FOOTER LOAD MORE --- */}
            {hasMore && (
                <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                    <Button type="text" size="small" onClick={handleLoadMore} loading={loadingMore} style={{ color: '#1890ff', fontSize: 12 }}>
                        View more
                    </Button>
                </div>
            )}
        </div>
    );
};