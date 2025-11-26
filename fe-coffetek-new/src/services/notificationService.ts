// services/notificationService.ts

import { Notification, PaginatedResponse } from "@/interfaces";
import api from "@/lib/api";


export interface UnreadCountResponse {
    unreadCount: number;
}

export const notificationService = {
    // 1. Lấy danh sách thông báo (có phân trang & lọc)
    async getAll(page: number = 1, size: number = 10, type?: string, isRead?: boolean) {
        // Xây dựng query params
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (type) {
            params.append('type', type);
        }
        if (isRead !== null && isRead !== undefined) {
            params.append('isRead', isRead.toString());
        }


        const res = await api.get(`/notifications?${params.toString()}`);
        console.log(">>> isRead", isRead)
        return res.data as PaginatedResponse<Notification>;
    },

    // 2. Lấy số lượng chưa đọc
    async getUnreadCount() {
        const res = await api.get("/notifications/unread-count");
        return res.data as UnreadCountResponse;
    },

    // 3. Đánh dấu tất cả là đã đọc
    async markAllAsRead() {
        const res = await api.patch("/notifications/read-all");
        return res.data;
    },

    // 4. Đánh dấu 1 thông báo cụ thể là đã đọc
    async markAsRead(id: number) {
        const res = await api.patch(`/notifications/${id}/read`);
        return res.data;
    },

    // 5. Xóa thông báo
    async remove(id: number) {
        const res = await api.delete(`/notifications/${id}`);
        return res.data;
    },


};