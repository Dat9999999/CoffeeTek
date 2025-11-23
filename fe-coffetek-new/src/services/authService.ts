// services/authService.ts

import { GenderEnum, Role } from "@/enum";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

export interface AuthAssignRoleDto {
    userId: number;
    roleName: string;
}

// types/user.ts
export interface UserDetail {
    id: number;
    birthday: string; // ISO date string
    sex: GenderEnum; //"male" | "female" | "other";
    avatar_url: string;
    address: string;
    userId: number;
}

export interface UserRole {
    id: number;
    role_name: Role;
}

export interface UserLoginInfo {
    id: number;
    phone_number: string;
    email: string;
    first_name: string;
    last_name: string;
    is_locked: boolean;
    detail: UserDetail;
    roles: UserRole[];
}


export const authService = {
    async loginGoogle(payload: { token: string }) {
        const res = await api.post(`/auth/google`, payload);
        return res.data;
    },

    async editRole(dto: AuthAssignRoleDto, assign: boolean) {
        const res = await api.put(`/auth/edit-role?assign=${assign}`, dto);
        return res.data;
    },

    async getAllRole() {
        const res = await api.get("/auth/roles");
        return res.data;
    },

    async getUserLoginInfo() {
        const res = await api.get("/user/me");
        return res.data as UserLoginInfo;
    },

    async updateSecurity(payload: {
        phone_number: string;
        password: string;
        address: string;
    }) {
        const res = await api.put(`/auth/security`, payload);
        return res.data;
    },

    // Trong authService.ts
    logout(setUser?: React.Dispatch<React.SetStateAction<UserLoginInfo | null>>, setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>) {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_INFO);
            if (setUser) setUser(null);
            if (setIsAuthenticated) setIsAuthenticated(false);
            window.location.href = "/auth/login";
        }
    }

}