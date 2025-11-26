"use client";

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Bell,
    CheckCheck,
    Loader2,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/interfaces';
import { getLucideIcon, NOTIFICATION_TAB_ITEMS_CUSTOMER } from '@/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import 'dayjs/locale/en';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
dayjs.locale('en');
dayjs.extend(relativeTime);

interface NotificationPopoverProps {
    onMarkAsReadSuccess?: () => void;
    refreshKey?: number;
}



export const HomeNotificationPopoverContent: React.FC<NotificationPopoverProps> = ({
    onMarkAsReadSuccess,
    refreshKey = 0
}) => {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterIsRead, setFilterIsRead] = useState<string>('all');




    const getFilterParams = () => {
        if (filterIsRead === 'read') return true;
        if (filterIsRead === 'unread') return false;
        return undefined;
    };

    const fetchNotifications = async (currentPage: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const typeParam = filterType === 'all' ? undefined : filterType;
            const res = await notificationService.getAll(currentPage, 5, typeParam, getFilterParams());

            if (isLoadMore) {
                setNotifications((prev) => {
                    const ids = new Set(prev.map(n => n.id));
                    const uniqueNew = res.data.filter(item => !ids.has(item.id));
                    return [...prev, ...uniqueNew];
                });
            } else {
                setNotifications(res.data);
            }

            setHasMore(res.data.length >= 5);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchNewAndMerge = async () => {
        try {
            const typeParam = filterType === 'all' ? undefined : filterType;
            const res = await notificationService.getAll(1, 5, typeParam, getFilterParams());

            setNotifications(prev => {
                const ids = new Set(prev.map(n => n.id));
                const newItems = res.data.filter(n => !ids.has(n.id));
                return newItems.length ? [...newItems, ...prev] : prev;
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (refreshKey > 0) fetchNewAndMerge();
    }, [refreshKey]);

    useEffect(() => {
        setPage(1);
        fetchNotifications(1);
    }, [filterType, filterIsRead]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchNotifications(next, true);
    };

    const handleMarkAsRead = async (item: Notification) => {
        if (item.isRead) return;

        try {
            setNotifications(prev =>
                prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
            );

            await notificationService.markAsRead(item.id);

            onMarkAsReadSuccess?.();
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            await notificationService.markAllAsRead();

            toast.success("All notifications marked as read");

            setPage(1);
            fetchNotifications(1);

            onMarkAsReadSuccess?.();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-[380px] max-w-[90vw] flex flex-col bg-white rounded-md">
            {/* HEADER */}
            <div className="px-2 pt-3 pb-2 border-b bg-background sticky top-0 z-10 rounded-t-md">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Notifications</h3>

                    <div className="flex gap-2 items-center">
                        <Select value={filterIsRead} onValueChange={setFilterIsRead}>
                            <SelectTrigger size='sm' className="h-4 w-[90px] text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="unread">Unread</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Thêm delayDuration={0} để hiện ngay lập tức */}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    title='Mark all as read'
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-8"
                                    onClick={handleMarkAllRead}
                                >
                                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-999">
                                <span>Mark all as read</span>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <Tabs value={filterType} onValueChange={setFilterType}>
                    <TabsList className="grid grid-cols-5 w-full">
                        {NOTIFICATION_TAB_ITEMS_CUSTOMER.map(t => (
                            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* LIST CONTENT */}
            <ScrollArea className="h-[400px] bg-gray-50/30 w-full">
                <div className="flex flex-col px-2 pb-2 w-full">

                    {loading && !loadingMore && notifications.length === 0 && (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <span className="text-sm">No notifications</span>
                        </div>
                    )}

                    {notifications.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleMarkAsRead(item)}
                            className={cn(
                                "flex gap-3 p-2 border-b last:border-0 cursor-pointer hover:bg-gray-100 transition-all relative group w-full",
                                !item.isRead
                                    ? "bg-white border-l-[3px] border-l-blue-500"
                                    : "bg-gray-50/50 border-l-transparent"
                            )}
                        >
                            <Avatar className={cn(
                                "h-8 w-8 border shadow-sm shrink-0",
                                !item.isRead ? "bg-blue-50" : "bg-white"
                            )}>
                                <AvatarFallback>
                                    {getLucideIcon(item.type)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className={cn(
                                        "text-sm leading-tight line-clamp-2 pr-2",
                                        !item.isRead ? "font-semibold text-gray-900" : "text-gray-600 font-medium"
                                    )}>
                                        {item.title}
                                    </p>
                                    {!item.isRead && (
                                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2">{item.message}</p>

                                <p className="text-[10px] text-gray-400 font-medium pt-1">
                                    {dayjs(item.createdAt).fromNow()}
                                </p>
                            </div>
                        </div>
                    ))}

                    {hasMore && (
                        <div className="p-1 text-center border-t bg-white">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="text-xs h-8 w-full text-blue-600"
                            >
                                {loadingMore && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                View more
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>

        </div >
    );
};
