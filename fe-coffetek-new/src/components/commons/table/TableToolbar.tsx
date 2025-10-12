'use client';

import { Input, Button, Space, Row, Col } from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined, PlusSquareOutlined, PlusCircleTwoTone, PlusCircleOutlined, DeleteTwoTone } from "@ant-design/icons";

interface TableToolbarProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    filters?: React.ReactNode;
    onAdd?: () => void;
    addLabel?: string;
    onDeleteMany?: () => void;
    deleteManyLabel?: string;
}

export function TableToolbar({
    search,
    onSearchChange,
    filters,
    onAdd,
    addLabel = "Add",
    onDeleteMany,
    deleteManyLabel = "Delete Selected",
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
                        />
                    )}
                    {filters}

                </Space>
            </Col>

            {/* Bên phải: nút Add và Delete Many */}
            <Col flex="none">
                <Space wrap>
                    {onDeleteMany && (
                        <Button danger type="default" icon={<DeleteOutlined />} onClick={onDeleteMany}>
                            {deleteManyLabel}
                        </Button>
                    )}
                    {onAdd && (
                        <Button type="primary" icon={<PlusCircleOutlined />} onClick={onAdd}>
                            {addLabel}
                        </Button>
                    )}
                </Space>
            </Col>
        </Row>
    );
}