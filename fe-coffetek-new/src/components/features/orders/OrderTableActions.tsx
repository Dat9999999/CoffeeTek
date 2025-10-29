// src/components/features/orders/OrderTableActions.tsx
"use client";

import { Dropdown, Button, theme } from "antd";
import {
    MoreOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { Order } from "@/interfaces";
import { OrderStatus } from "@/interfaces"; // Assuming types.ts exports OrderStatus

interface OrderTableActionsProps {
    record: Order;
    onDetail?: (record: Order) => void;
    onEdit?: (record: Order) => void;
    onDelete?: (record: Order) => void;
    onChangeStatus?: (record: Order) => void;
}

export function OrderTableActions({
    record,
    onDetail,
    onEdit,
    onDelete,
    onChangeStatus,
}: OrderTableActionsProps) {
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

    if (record.status === OrderStatus.PENDING && onEdit) {
        items.push({
            key: "edit",
            label: <span style={{ color: token.colorWarning }}>Edit</span>,
            icon: <EditOutlined style={{ color: token.colorWarning }} />,
            onClick: () => onEdit(record),
        });
    }

    if ((record.status === OrderStatus.PENDING || record.status === OrderStatus.PAID) && onChangeStatus) {
        items.push({
            key: "change-status",
            label: <span style={{ color: token.colorInfo }}>Change Status</span>,
            icon: <UserSwitchOutlined style={{ color: token.colorInfo }} />,
            onClick: () => onChangeStatus(record),
        });
    }

    if (onDelete) {
        items.push({
            key: "delete",
            label: <span style={{ color: token.colorError }}>Delete</span>,
            icon: <DeleteOutlined style={{ color: token.colorError }} />,
            onClick: () => onDelete(record),
        });
    }

    return (
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    );
}