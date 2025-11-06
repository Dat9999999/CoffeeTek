"use client";

import React, { useState, useEffect } from 'react';
import { theme, Badge, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { orderService } from '@/services/orderService';

const { useToken } = theme;

const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string);

interface ProcessOrderCountDisplayProps {
    onCountUpdate?: () => void;
    children: React.ReactNode;
}

// Tên component đã được cập nhật
export function BadgeProcessOrderCountDisplay({
    onCountUpdate,
    children
}: ProcessOrderCountDisplayProps) {
    const { token } = useToken();
    const [activeCount, setActiveCount] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    // ... (Toàn bộ logic useEffects fetch data và socket.io giữ nguyên) ...
    // useEffect fetchInitialCount (GIỮ NGUYÊN)
    useEffect(() => {
        async function fetchInitialCount() {
            try {
                const response = await orderService.getProcessOrderCount();
                setActiveCount(response.count);
            } catch (error) {
                console.error("Failed to fetch initial order count:", error);
                setActiveCount(0);
            }
        }
        fetchInitialCount();
    }, []);

    // useEffect lắng nghe socket (GIỮ NGUYÊN)
    useEffect(() => {
        const onOrderCountUpdateSocket = (count: number) => {
            console.log('Socket: Nhận activeOrderCount =', count);
            setActiveCount(count);
            if (onCountUpdate) {
                onCountUpdate();
            }
        };
        const onConnect = () => {
            setIsConnected(true);
        };
        const onDisconnect = () => {
            setIsConnected(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("processOrderCount", onOrderCountUpdateSocket);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("processOrderCount", onOrderCountUpdateSocket);
        };
    }, [onCountUpdate]);


    if (activeCount === null) {
        return <Spin size="small" />;
    }

    // Logic lấy màu (GIỮ NGUYÊN)
    const getIconColor = () => {
        if (activeCount === 0) {
            return token.colorTextSecondary;
        }
        return isConnected ? token.colorText : token.colorError;
    };

    const getBadgeColor = () => {
        return isConnected ? token.colorPrimary : token.colorError;
    };

    // Hiển thị
    return (
        <Badge
            offset={[5, -5]}
            count={activeCount}

            size="small"
            styles={{
                indicator: {
                    backgroundColor: getBadgeColor(),
                    transition: 'background-color 0.4s ease',
                }
            }}
        >
            {children}
        </Badge>
    );
}