import api from "@/lib/api";

export interface AuthAssignRoleDto {
    userId: number;
    roleName: string;
}

export const authService = {

    async editRole(dto: AuthAssignRoleDto, assign: boolean) {
        const res = await api.put(`/auth/edit-role?assign=${assign}`, dto);
        return res.data;
    },

    async getAllRole() {
        const res = await api.get("/auth/roles");
        return res.data;
    },
};
