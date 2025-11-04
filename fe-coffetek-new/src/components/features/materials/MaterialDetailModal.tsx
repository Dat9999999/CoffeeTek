"use client";

import { useEffect, useState } from "react";
import { Modal, Descriptions, Spin, message, List, Button, theme } from "antd";
import type { Material, MaterialRemain } from "@/interfaces";
import { materialService } from "@/services/materialService";
import { inventoryService } from "@/services/inventoryService";

interface MaterialDetailModalProps {
    open: boolean;
    onClose: () => void;
    record?: Material | null;
}

const PAGE_SIZE = 5;

export function MaterialDetailModal({ open, onClose, record }: MaterialDetailModalProps) {
    const [detail, setDetail] = useState<Material | null>(null);
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [history, setHistory] = useState<MaterialRemain[]>([]);
    const [list, setList] = useState<MaterialRemain[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Load material detail
    useEffect(() => {
        if (open && record?.id) {
            setLoading(true);
            materialService
                .getById(record.id)
                .then((res) => setDetail(res))
                .catch(() => message.error("Failed to load material details"))
                .finally(() => setLoading(false));
        } else {
            setDetail(null);
        }
    }, [open, record]);

    // Load inventory history
    useEffect(() => {
        if (open && record?.id) {
            setHistoryLoading(true);
            inventoryService
                .getByMaterialId(record.id)
                .then((res) => {
                    setHistory(res);
                    setList(res.slice(0, PAGE_SIZE));
                    setPage(1);
                })
                .catch(() => message.error("Failed to load inventory history"))
                .finally(() => setHistoryLoading(false));
        } else {
            setHistory([]);
            setList([]);
            setPage(1);
        }
    }, [open, record]);

    const onLoadMore = () => {
        const nextPage = page + 1;
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setList(list.concat(history.slice(start, end)));
        setPage(nextPage);
    };

    const loadMore =
        !historyLoading && list.length < history.length ? (
            <div style={{ textAlign: "center", marginTop: 12, height: 32, lineHeight: "32px" }}>
                <Button onClick={onLoadMore}>Load more</Button>
            </div>
        ) : null;

    return (
        <Modal title="Material Details" open={open} onCancel={onClose} footer={null} destroyOnClose>
            {loading ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin />
                </div>
            ) : detail ? (
                <>
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
                        <Descriptions.Item label="Name">{detail.name}</Descriptions.Item>
                        <Descriptions.Item label="System quantity">{detail.remain ?? "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Code">{detail.code}</Descriptions.Item>
                        <Descriptions.Item label="Unit Name">{detail.unit?.name}</Descriptions.Item>
                        <Descriptions.Item label="Unit Symbol">{detail.unit?.symbol}</Descriptions.Item>
                        <Descriptions.Item label="Unit Class">{detail.unit?.class}</Descriptions.Item>
                    </Descriptions>

                    <h3 style={{ marginTop: 16 }}>Inventory History</h3>
                    {historyLoading ? (
                        <Spin />
                    ) : history.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={list}
                            loadMore={loadMore}
                            renderItem={(item) => {
                                const itemDate = new Date(item.date);
                                const now = new Date();

                                const isToday =
                                    itemDate.getFullYear() === now.getFullYear() &&
                                    itemDate.getMonth() === now.getMonth() &&
                                    itemDate.getDate() === now.getDate();

                                return (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <>
                                                    Date:{" "}
                                                    {isToday ? (
                                                        <>
                                                            {itemDate.toLocaleString()}{" "}
                                                            <span style={{ color: token.colorTextSecondary }}>
                                                                (System is calculating…)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        itemDate.toLocaleDateString()
                                                    )}
                                                </>
                                            }
                                            description={`Quantity: ${item.remain}`}
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    ) : (
                        <p>No inventory history</p>
                    )}
                </>
            ) : (
                <p>No data</p>
            )}
        </Modal>
    );
}
