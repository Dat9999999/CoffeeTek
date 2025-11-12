"use client";
import { Dropdown, Button, theme } from "antd";
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

interface TableActionsProps<T> {
    record: T;
    onDetail?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
}

export function TableActions<T>({
    record,
    onDetail,
    onEdit,
    onDelete,
}: TableActionsProps<T>) {
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

    if (onEdit) {
        items.push({
            key: "edit",
            label: <span style={{ color: token.colorPrimary }}>Edit</span>,
            icon: <EditOutlined style={{ color: token.colorPrimary }} />,
            onClick: () => onEdit(record),
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
        <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    );
}
