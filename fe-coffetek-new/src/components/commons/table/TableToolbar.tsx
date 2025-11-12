'use client';

import Link from "next/link";
import { Input, Button, Space, Row, Col, theme, Grid } from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface TableToolbarProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    filters?: React.ReactNode;
    buttonRights?: React.ReactNode;
    addHref?: string;
    addLabel?: string;
    searchLabel?: string;
    onDeleteMany?: () => void;
    onAdd?: () => void;
    deleteManyLabel?: string;
}

export function TableToolbar({
    search,
    onSearchChange,
    filters,
    addHref,
    addLabel = "Add",
    onDeleteMany,
    buttonRights,
    deleteManyLabel = "Delete Selected",
    searchLabel = "Search...",
    onAdd,
}: TableToolbarProps) {
    const { token } = theme.useToken();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    return (
        <div
            style={{
                marginBottom: 16,
                padding: "8px 0",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <Row
                gutter={[8, 8]}
                align="middle"
                justify={isMobile ? "start" : "space-between"}
                wrap
            >
                {/* 🔍 Bên trái: Search + Filters */}
                <Col flex="auto">
                    <Space
                        wrap
                        style={{
                            width: "100%",
                        }}
                    >
                        {onSearchChange && (
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                placeholder={searchLabel}
                                value={search}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                style={{
                                    width: isMobile ? "100%" : 220,
                                    maxWidth: "100%",
                                }}
                            />
                        )}
                        {filters}
                    </Space>
                </Col>

                {/* ➕ Bên phải: Add + Delete */}
                <Col flex={isMobile ? "100%" : "none"}>
                    <Space
                        wrap
                        style={{
                            width: "100%",
                            justifyContent: isMobile ? "flex-end" : "flex-end",
                        }}
                    >
                        {onDeleteMany && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={onDeleteMany}
                                style={{
                                    width: isMobile ? "100%" : "auto",
                                }}
                            >
                                {deleteManyLabel}
                            </Button>
                        )}

                        {buttonRights}

                        {addHref && (
                            <Link href={addHref} passHref>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{
                                        width: isMobile ? "100%" : "auto",
                                    }}
                                >
                                    {addLabel}
                                </Button>
                            </Link>
                        )}

                        {onAdd && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                style={{
                                    width: isMobile ? "100%" : "auto",
                                }}
                                onClick={onAdd}
                            >
                                {addLabel}
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        </div>
    );
}
