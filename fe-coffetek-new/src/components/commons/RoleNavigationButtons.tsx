"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Role } from "@/enum";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Package, Store } from "lucide-react"; // Thêm icons

// ✅ Nhóm role cho từng loại chức năng
const MANAGER_ROLES: Role[] = [Role.MANAGER, Role.OWNER];
const STOCK_ROLES: Role[] = [Role.STOCKTAKER];
const POS_ROLES: Role[] = [Role.CASHIER, Role.BAKER, Role.BARISTA, Role.STAFF, Role.STOCKTAKER];

interface RoleNavigationButtonsProps {
    layout?: "default" | "dropdown";
}

export const RoleNavigationButtons = ({ layout = "default" }: RoleNavigationButtonsProps) => {
    const { user, isAuthenticated } = useAuthContext();

    if (!isAuthenticated || !user) return null;

    const userRoles = user.roles.map(r => r.role_name);

    const hasManagerRole = userRoles.some(r => MANAGER_ROLES.includes(r));
    const hasStockRole = userRoles.some(r => STOCK_ROLES.includes(r));
    const hasPosRole = userRoles.some(r => POS_ROLES.includes(r));

    // Render dạng item trong Dropdown Menu (Có thêm Icon)
    if (layout === "dropdown") {
        return (
            <>
                {hasManagerRole && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="w-full cursor-pointer flex items-center">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Shop Control</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {hasStockRole && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/materials" className="w-full cursor-pointer flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Inventory</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {hasPosRole && (
                    <DropdownMenuItem asChild>
                        <Link href="/pos" className="w-full cursor-pointer flex items-center">
                            <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>POS System</span>
                        </Link>
                    </DropdownMenuItem>
                )}
            </>
        );
    }

    // Render dạng Button thường (cho Mobile)
    return (
        <div className="flex items-center space-x-3">
            {hasManagerRole && (
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard">Shop Control</Link>
                </Button>
            )}

            {hasStockRole && (
                <Button asChild variant="secondary">
                    <Link href="/admin/materials">Inventory</Link>
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