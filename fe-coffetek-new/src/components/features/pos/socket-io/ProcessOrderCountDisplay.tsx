"use client";

import React, { useState, useEffect } from 'react';
import { theme, Typography, Spin } from 'antd';
import { io, Socket } from 'socket.io-client';
import { orderService } from '@/services/orderService';

const { Text } = Typography;
const { useToken } = theme;

// (Thay đổi URL nếu NEXT_PUBLIC_BACKEND_URL chưa đúng)
const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string);

interface ProcessOrderCountDisplayProps {
    onCountUpdate?: () => void; // Làm nó optional để an toàn
}

export function ProcessOrderCountDisplay({
    onCountUpdate
}: ProcessOrderCountDisplayProps) {
    const { token } = useToken();
    const [activeCount, setActiveCount] = useState<number | null>(null); // Giữ nguyên là null
    const [isConnected, setIsConnected] = useState(socket.connected);

    // useEffect để GỌI API LẤY DỮ LIỆU BAN ĐẦU (Giữ nguyên)
    useEffect(() => {
        // Hàm này chỉ chạy 1 LẦN KHI COMPONENT MOUNT
        async function fetchInitialCount() {
            try {
                // Gọi API bạn vừa tạo
                const response = await orderService.getProcessOrderCount();
                console.log("response: ", response)
                setActiveCount(response.count);
                // console.log('activeCount', activeCount); // Bị log trước khi state update
            } catch (error) {
                console.error("Failed to fetch initial order count:", error);
                setActiveCount(0); // Nếu lỗi, hiển thị 0
            }
        }

        fetchInitialCount(); // Gọi hàm
    }, []); // [] Mảng rỗng đảm bảo nó chỉ chạy 1 lần lúc mount

    // useEffect này để LẮNG NGHE CẬP NHẬT
    useEffect(() => {
        const onOrderCountUpdateSocket = (count: number) => {
            console.log('Socket: Nhận activeOrderCount =', count);
            setActiveCount(count);

            // ✅ 1. GỌI HÀM CỦA CHA KHI CÓ UPDATE
            // (onCountUpdate chính là hàm fetchOrders() đã được truyền xuống)
            if (onCountUpdate) {
                console.log('Socket: Đang gọi fetchOrders() từ component cha...');
                onCountUpdate();
            }
        };

        const onConnect = () => {
            console.log("Socket connected!", socket.id);
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log("Socket disconnected.");
            setIsConnected(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        // (Tên 'processOrderCount' phải khớp với tên bạn phát ra từ NestJS)
        socket.on("processOrderCount", onOrderCountUpdateSocket);

        // Dọn dẹp
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("processOrderCount", onOrderCountUpdateSocket);
        };
    }, [onCountUpdate]); // ✅ 2. Thêm onCountUpdate vào dependency array

    // Render logic (giữ nguyên)
    // Nếu activeCount VẪN CÒN là null (đang fetch API), thì hiển thị Spin
    if (activeCount === null) {
        return <Spin size="small" />;
    }

    const getCountColor = () => {
        // Ưu tiên 1: Nếu count là 0, luôn dùng màu secondary
        if (activeCount === 0) {
            return token.colorTextSecondary;
        }

        // Ưu tiên 2: Nếu khác 0, kiểm tra kết nối
        return isConnected ? token.colorPrimary : token.colorError;
    };
    // Hiển thị dữ liệu
    return (
        <Text
            style={{
                color: getCountColor(),
                fontWeight: activeCount === 0 ? 600 : 700,
                fontSize: '1.1rem',
                transition: 'color 0.4s ease',
            }}
        >
            {activeCount}
        </Text>
    );
}