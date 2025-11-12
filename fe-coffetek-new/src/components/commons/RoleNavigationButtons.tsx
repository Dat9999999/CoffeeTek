"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Role } from "@/enum";

// ✅ Nhóm role cho từng loại chức năng
const MANAGER_ROLES: Role[] = [Role.MANAGER, Role.OWNER];
const STOCK_ROLES: Role[] = [Role.STOCKTAKER];
const POS_ROLES: Role[] = [Role.CASHIER, Role.BAKER, Role.BARISTA, Role.STAFF, Role.STOCKTAKER];

export const RoleNavigationButtons = () => {
    const { user, isAuthenticated } = useAuthContext();

    if (!isAuthenticated || !user) return null;
    console.log(user)
    const userRoles = user.roles.map(r => r.role_name);

    const hasManagerRole = userRoles.some(r => MANAGER_ROLES.includes(r));
    const hasStockRole = userRoles.some(r => STOCK_ROLES.includes(r));
    const hasPosRole = userRoles.some(r => POS_ROLES.includes(r));

    return (
        <div className="flex items-center space-x-3">
            {hasManagerRole && (
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard">Shop Control</Link>
                </Button>
            )}

            {hasStockRole && (
                <Button asChild variant="secondary">
                    <Link href="/admin/materials">Kho</Link>
                </Button>
            )}

            {hasPosRole && (
                <Button asChild variant="secondary">
                    <Link href="/pos">POS</Link>
                </Button>
            )}
        </div>
    );
};
