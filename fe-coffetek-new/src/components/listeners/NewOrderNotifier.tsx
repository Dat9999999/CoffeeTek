"use client";

import { useEffect } from 'react';
import { notification } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { getSocketInstance } from '@/lib/socket';

interface OrderPayload {
    id: number | string;
    final_price: number;
    customerPhone?: string;
    order_details: any[];
}

/**
 * A "hidden" component that listens for the 'newOrder' socket event
 * and triggers an Ant Design notification. It renders nothing.
 */
export function NewOrderNotifier() {
    useEffect(() => {
        const socket = getSocketInstance();
        
        const onNewOrder = (order: OrderPayload) => {
            console.log('Socket: Received newOrder =', order);
            if (!order) return;

            const orderId = order.id;

            // Formatting for Vietnamese currency (VND) is kept from original logic
            const total = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(order.final_price);

            const itemsCount = order.order_details?.length || 0;

            notification.success({
                message: `New Order Received!`,
                description: `Order #${orderId} - (${itemsCount} items) - Total: ${total}`,
                placement: 'topRight',
                icon: <SoundOutlined style={{ color: '#52c41a' }} />,
                duration: 10,
                showProgress: true,
                pauseOnHover: true,
            });
        };

        const onConnect = () => {
            console.log("NewOrderNotifier Socket connected!", socket.id);
        };

        const onDisconnect = () => {
            console.log("NewOrderNotifier Socket disconnected.");
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("newOrder", onNewOrder);

        // Cleanup listeners on unmount (but don't disconnect the shared socket)
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("newOrder", onNewOrder);
        };
    }, []); // Empty array ensures this runs only once

    // This component does not render any visual elements
    return null;
}