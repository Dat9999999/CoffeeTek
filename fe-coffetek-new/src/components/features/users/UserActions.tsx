"use client";

import { Dropdown, Button, theme } from "antd";
import {
    MoreOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { User } from "@/interfaces";

interface UserTableActionsProps {
    record: User;
    onDetail?: (record: User) => void;
    onLock?: (record: User) => void;
    onUnlock?: (record: User) => void;
    onEditRole?: (record: User) => void;
}

export function UserTableActions({
    record,
    onDetail,
    onLock,
    onUnlock,
    onEditRole,
}: UserTableActionsProps) {
    const { token } = theme.useToken();

    const items: MenuProps["items"] = [];

    if (onDetail) {
        items.push({
            key: "detail",
            label: <span style={{ color: token.colorPrimary }}>Detail</span>,
            icon: <EyeOutlined style={{ color: token.colorPrimary }} />,
            onClick: () => onDetail(record),
        });
    }

    if (onEditRole) {
        items.push({
            key: "edit-role",
            label: <span style={{ color: token.colorWarning }}>Edit Role</span>,
            icon: <UserSwitchOutlined style={{ color: token.colorPrimary }} />,
            onClick: () => onEditRole(record),
        });
    }

    if (record.is_locked && onUnlock) {
        items.push({
            key: "unlock",
            label: <span style={{ color: token.colorSuccess }}>Unlock</span>,
            icon: <UnlockOutlined style={{ color: token.colorSuccess }} />,
            onClick: () => onUnlock(record),
        });
    } else if (!record.is_locked && onLock) {
        items.push({
            key: "lock",
            label: <span style={{ color: token.colorError }}>Lock</span>,
            icon: <LockOutlined style={{ color: token.colorError }} />,
            onClick: () => onLock(record),
        });
    }

    return (
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    );
}
