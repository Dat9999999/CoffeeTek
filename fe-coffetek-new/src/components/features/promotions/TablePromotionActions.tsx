"use client";
import { Dropdown, Button, theme } from "antd";
import {
    MoreOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PoweroffOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import dayjs from "dayjs"; // ✅ 1. Import dayjs
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // ✅ 2. Import plugin
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // ✅ 2. Import plugin
dayjs.extend(isSameOrAfter); // ✅ 3. Sử dụng plugin
dayjs.extend(isSameOrBefore); // ✅ 3. Sử dụng plugin

interface TableActionsProps<T> {
    record: T;
    onDetail?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onToggleActive?: (record: T) => void;
}

// ✅ 4. Cập nhật constraint, yêu cầu record phải có start_date và end_date
export function TablePromotionActions<
    T extends {
        is_active?: boolean;
        start_date: string;
        end_date: string;
    }
>({
    record,
    onDetail,
    onEdit,
    onDelete,
    onToggleActive,
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

    if (onToggleActive) {
        const isActive = !!record.is_active;

        // ✅ 5. Logic kiểm tra ngày
        const now = dayjs();
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);

        // Kiểm tra xem ngày hiện tại có nằm trong khoảng hợp lệ không (so sánh theo 'ngày')
        const isWithinValidPeriod =
            now.isSameOrAfter(start, "day") && now.isSameOrBefore(end, "day");

        // Chỉ hiển thị nút Toggle nếu:
        // 1. Promotion đang active (để cho phép deactivate)
        // 2. Promotion đang inactive VÀ ngày hiện tại nằm trong khoảng hợp lệ (để cho phép activate)
        const canToggle = isActive || (!isActive && isWithinValidPeriod);

        // ✅ 6. Chỉ render nút nếu điều kiện canToggle là true
        if (canToggle) {
            items.push({
                key: "toggleActive",
                label: (
                    <span
                        style={{ color: isActive ? token.colorWarning : token.colorSuccess }}
                    >
                        {isActive ? "Deactivate" : "Activate"}
                    </span>
                ),
                icon: (
                    <PoweroffOutlined
                        style={{ color: isActive ? token.colorWarning : token.colorSuccess }}
                    />
                ),
                onClick: () => onToggleActive(record),
            });
        }
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