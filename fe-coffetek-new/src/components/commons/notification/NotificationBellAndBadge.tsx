"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Badge, Popover, theme } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { motion, Variants } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { NotificationPopoverContent } from './NotificationPopoverContent';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const NotificationBellAndBadge = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [shouldShake, setShouldShake] = useState<boolean>(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { token } = theme.useToken();
    // State để trigger reload ở component con
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const { user } = useAuthContext();
    const prevUnreadCountRef = useRef<number>(0);

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const response = await notificationService.getUnreadCount();
            if (response && typeof response.unreadCount === 'number') {
                setUnreadCount(response.unreadCount);
                prevUnreadCountRef.current = response.unreadCount;
            }
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    // 1. Initial Load
    useEffect(() => {
        fetchUnreadCount();
    }, [user?.id]);

    // 2. Shake Effect
    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            setShouldShake(true);
            const timer = setTimeout(() => setShouldShake(false), 500);
            return () => clearTimeout(timer);
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);

    // 3. Socket Connection
    useEffect(() => {
        if (!user?.id) return;
        const socket: Socket = io(API_URL, { transports: ['websocket'] });

        socket.on('connect', () => socket.emit('join_room', user.id));

        socket.on('new_notification', (data: any) => {
            console.log("New notification received:", data);

            // Cập nhật số lượng Badge
            if (data && typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            } else {
                setUnreadCount(prev => prev + 1);
            }

            // Trigger reload list ở con
            setRefreshKey(prev => prev + 1);
        });

        return () => { socket.disconnect(); };
    }, [user?.id]);

    const shakeVariants: Variants = {
        shake: { rotate: [0, 15, -15, 15, -15, 0], transition: { duration: 0.5 } },
        idle: { rotate: 0 },
    };

    return (
        <Popover
            content={
                <NotificationPopoverContent
                    onMarkAsReadSuccess={fetchUnreadCount}
                    refreshKey={refreshKey}
                />
            }
            trigger="click"
            placement="bottomRight"
            arrow={false}

            // --- THÊM DÒNG NÀY ---
            // Khi đóng popover, nó sẽ hủy component con. 
            // Khi mở lại, component con được tạo mới -> Tự động fetch lại trang 1.
            destroyTooltipOnHide={true}

            overlayInnerStyle={{ padding: 0 }}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
        >
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', lineHeight: 0, cursor: 'pointer'
                }}
            >
                <Badge
                    count={unreadCount}
                    offset={[2, 0]}
                    style={{ backgroundColor: token.colorPrimary, fontSize: '9px', boxShadow: '0 0 0 1px #fff' }}
                >
                    <motion.div
                        variants={shakeVariants}
                        initial="idle"
                        animate={shouldShake ? 'shake' : 'idle'}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <BellOutlined style={{ fontSize: '22px', color: '#4b5563' }} />
                    </motion.div>
                </Badge>
            </div>
        </Popover>
    );
};