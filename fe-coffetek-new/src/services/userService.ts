import api from "@/lib/api";
import type { User } from "@/interfaces";
import type { GenderEnum } from "@/enum";

/**
 * ✅ Kiểu dữ liệu dùng cho query get-all
 */
export interface GetAllUsersParams {
    page: number;
    size: number;
    searchName?: string;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}

/**
 * ✅ Kiểu dữ liệu cập nhật thông tin user
 */
export interface UpdateUserDto {
    address?: string;
    sex?: GenderEnum;
    birthday?: string;
    avatar?: File; // upload file
}

/**
 * ✅ Kiểu dữ liệu thay đổi thông tin nhạy cảm (email, phone)
 */
export interface ChangeSensitiveInfoDto {
    email?: string;
    phone?: string;
}

/**
 * ✅ Service call API user
 */
export const userService = {
    /**
     * Lấy thông tin user hiện tại
     */
    async getMe() {
        const res = await api.get<User>("/user/me");
        return res.data;
    },

    /**
     * Lấy danh sách tất cả user (dành cho admin)
     */
    async getAll(params: GetAllUsersParams) {
        const res = await api.get("/user/get-all", { params });
        return res.data;
    },

    /**
     * Cập nhật thông tin user (bao gồm upload avatar)
     */
    async updateInfo(id: number, data: UpdateUserDto) {
        const formData = new FormData();
        if (data.avatar) formData.append("avatar", data.avatar);
        if (data.address) formData.append("address", data.address);
        if (data.sex) formData.append("sex", data.sex);
        if (data.birthday) formData.append("birthday", data.birthday);

        const res = await api.patch(`/user/update/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    /**
     * Khóa tài khoản user (owner/manager)
     */
    async lockUser(id: number) {
        const res = await api.delete(`/user/lock/${id}`);
        return res.data;
    },

    /**
     * Mở khóa tài khoản user (owner/manager)
     */
    async unlockUser(id: number) {
        const res = await api.patch(`/user/unlock/${id}`);
        return res.data;
    },

    /**
     * Thay đổi thông tin nhạy cảm (email, phone)
     */
    async changeSensitiveInfo(id: number, data: ChangeSensitiveInfoDto) {
        const res = await api.put(`/user/change-sensitive/${id}`, data);
        return res.data;
    },

    async getAllRole() {
        const res = await api.get("/auth/roles");
        return res.data;
    },

    async searchPos(params: any) {
        const res = await api.get("/user/search-pos", { params });
        return res.data;
    },
};
