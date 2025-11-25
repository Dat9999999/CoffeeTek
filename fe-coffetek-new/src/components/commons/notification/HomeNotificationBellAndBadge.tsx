"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthContext } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { HomeNotificationPopoverContent } from './HomeNotificationPopoverContent';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const HomeNotificationBellAndBadge: React.FC = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [shouldShake, setShouldShake] = useState<boolean>(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
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

    useEffect(() => { fetchUnreadCount(); }, [user?.id]);

    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            setShouldShake(true);
            const timer = setTimeout(() => setShouldShake(false), 500);
            return () => clearTimeout(timer);
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);

    useEffect(() => {
        if (!user?.id) return;
        const socket: Socket = io(API_URL, { transports: ['websocket'] });
        socket.on('connect', () => socket.emit('join_room', user.id));
        socket.on('new_notification', (data: any) => {
            if (data && typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
            else setUnreadCount(prev => prev + 1);
            setRefreshKey(prev => prev + 1);
        });
        return () => { socket.disconnect(); };
    }, [user?.id]);

    const shakeVariants: Variants = {
        shake: { rotate: [0, 15, -15, 15, -15, 0], transition: { duration: 0.5 } },
        idle: { rotate: 0 },
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <motion.div
                        variants={shakeVariants}
                        initial="idle"
                        animate={shouldShake ? 'shake' : 'idle'}
                    >
                        <Bell className="h-6 w-6 text-gray-600" />
                    </motion.div>
                    {unreadCount > 0 && (
                        <span className={cn(
                            "absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white select-none",
                            unreadCount > 9 && "w-auto px-1 min-w-[16px]"
                        )}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>

            {/* Thêm p-0 và overflow-hidden để content con tự quản lý border radius */}
            <PopoverContent className="p-0 w-auto  shadow-xl rounded-lg overflow-hidden mr-4" align="end" sideOffset={1}>
                <HomeNotificationPopoverContent
                    onMarkAsReadSuccess={fetchUnreadCount}
                    refreshKey={refreshKey}
                />
            </PopoverContent>
        </Popover>
    );
};