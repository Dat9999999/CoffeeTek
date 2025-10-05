"use client";

import { Input, Button, Space, Row, Col } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

interface TableToolbarProps {
    search?: string;
    onSearchChange?: (value: string) => void;

    filters?: React.ReactNode; // Cho phép truyền filter tuỳ ý (Select, DatePicker...)

    onAdd?: () => void;
    addLabel?: string;
}

export function TableToolbar({
    search,
    onSearchChange,
    filters,
    onAdd,
    addLabel = "Add",
}: TableToolbarProps) {
    return (
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }} gutter={[8, 8]}>
            {/* Bên trái: search + filters */}
            <Col flex="auto">
                <Space wrap>
                    {onSearchChange && (
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            style={{ width: 200 }}
                        />
                    )}
                    {filters}
                </Space>
            </Col>

            {/* Bên phải: nút Add */}
            <Col flex="none">
                {onAdd && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                        {addLabel}
                    </Button>
                )}
            </Col>
        </Row>
    );
}
