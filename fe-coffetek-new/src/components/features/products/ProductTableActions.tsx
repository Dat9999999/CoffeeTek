"use client";
import { Dropdown, Button, theme } from "antd";
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Router } from "next/router";

interface ProductTableActionsProps<T> {
    record: T;
    onDetail?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onRecipeClick?: (record: T) => void;

}

export function ProductTableActions<T>({
    record,
    onDetail,
    onEdit,
    onDelete,
    onRecipeClick
}: ProductTableActionsProps<T>) {
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
            label: <span style={{ color: token.colorPrimary }}>Edit info</span>,
            icon: <EditOutlined style={{ color: token.colorPrimary }} />,
            onClick: () => onEdit(record),
        });
    }

    if (onRecipeClick) {
        items.push({
            key: "recipe",
            label: <span style={{ color: token.colorPrimary }}>Recipe</span>,
            icon: <FileTextOutlined style={{ color: token.colorPrimary }} />,
            onClick: () => onRecipeClick(record),
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
