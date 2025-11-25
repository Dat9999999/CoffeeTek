"use client";

import { Dropdown, Button, theme } from "antd";
import { MoreOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
// Đảm bảo import đúng đường dẫn interface của bạn
// (Có thể là "@/interfaces/types" hoặc nơi bạn định nghĩa VoucherGroup)
import { VoucherGroup } from "@/services/voucherService";

interface VoucherTableActionsProps {
    record: VoucherGroup; // SỬA: Dùng cụ thể VoucherGroup thay vì T
    onDelete: (record: VoucherGroup) => void;
    onDetail?: (record: VoucherGroup) => void;
    onEdit?: (record: VoucherGroup) => void;
}

// SỬA: Xóa bỏ <T> ở tên hàm
export function VoucherTableActions({
    record,
    onDetail,
    onEdit,
    onDelete,
}: VoucherTableActionsProps) {
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

    // --- LOGIC KIỂM TRA ---
    // Bây giờ TypeScript đã hiểu record là VoucherGroup nên sẽ không báo lỗi group_name nữa
    if (onDelete) {
        items.push({
            key: "delete",
            label: <span style={{ color: token.colorError }}>Delete</span>,
            icon: <DeleteOutlined style={{ color: token.colorError }} />,
            onClick: () => onDelete(record),
        });
    }

    // Nếu menu rỗng, ẩn nút
    if (items.length === 0) {
        return null;
    }

    return (
        <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
            arrow
        >
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
        </Dropdown>
    );
}