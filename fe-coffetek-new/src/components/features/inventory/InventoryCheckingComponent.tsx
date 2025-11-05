"use client";

import { PageHeader } from "@/components/layouts";
import {
    AuditOutlined,
    EditOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import {
    Table,
    Spin,
    message,
    theme,
    Space,
    Button,
    Tooltip,
    Flex,
} from "antd";
import type { SortOrder } from "antd/lib/table/interface";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventoryService";
import type { MaterialRemainSystemRecord } from "@/services/inventoryService";
import { MaterialDetailModal } from "@/components/features/materials";
import { ColumnsType } from "antd/es/table";
import { EditStockModal } from "./EditStockModal";

export type ExtendedRecord = MaterialRemainSystemRecord & { changes: number };

export function InventoryCheckingComponent() {
    const [data, setData] = useState<ExtendedRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ExtendedRecord | null>(null);
    const today = dayjs();
    const { token } = theme.useToken();
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await inventoryService.getSystemTracking(today.toDate());
            const withChanges: ExtendedRecord[] = res.map((item: MaterialRemainSystemRecord) => ({
                ...item,
                changes: item.record - item.lastRemainQuantity,
            }));
            withChanges.sort((a, b) => a.changes - b.changes);
            setData(withChanges);
        } catch (err) {
            message.error("Failed to load system tracking data");
        } finally {
            setLoading(false);
        }
    };
    // 🧩 Fetch data
    useEffect(() => {

        fetchData();
    }, []);

    // 🧾 Handle detail + edit modals
    const handleOpenDetail = (materialId: number) => {
        setSelectedMaterialId(materialId);
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedMaterialId(null);
    };
    const handleOpenEdit = (record: ExtendedRecord) => {
        setEditingRecord(record);
        setEditOpen(true);
    };
    const handleSaveEdit = (updated: ExtendedRecord) => {
        setData((prev) =>
            prev.map((item) =>
                item.materialId === updated.materialId ? updated : item
            )
        );
    };

    // ✅ Confirm changes → call update API
    const handleConfirm = async () => {
        try {
            setConfirming(true);
            // await Promise.all(
            //     data.map((record) =>
            //         inventoryService.update(record.materialId, {
            //             materialId: record.materialId,
            //             remain: record.record,
            //             date: today.toDate(),
            //         })
            //     )
            // );

            const payload = {
                date: today.toDate(),
                remainReality: data.map((record) => ({
                    materialId: record.materialId,
                    remain: record.record,
                })),
            };

            await inventoryService.create(payload);
            message.success("Inventory updated successfully!");
            await fetchData();
        } catch (err) {
            console.error(err);
            message.error("Failed to confirm inventory update");
        } finally {
            setConfirming(false);
        }
    };

    // 📊 Table columns
    const columns: ColumnsType<ExtendedRecord> = [
        {
            title: "No.",
            dataIndex: "index",
            key: "index",
            render: (_text, _record, index) => index + 1,
            width: 70,
        },
        {
            title: "Material",
            dataIndex: "materialName",
            key: "materialName",
            render: (_text, record) => (
                <span
                    onClick={() => handleOpenDetail(record.materialId)}
                    style={{
                        color: token.colorText,
                        cursor: "pointer",
                        transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = token.colorLink)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = token.colorText)}
                >
                    {record.materialName} ({record.materialUnit})
                </span>
            ),
        },
        {
            title: "Previous Stock",
            dataIndex: "lastRemainQuantity",
            key: "lastRemainQuantity",
            align: "right",
            sorter: (a, b) => a.lastRemainQuantity - b.lastRemainQuantity,
        },
        {
            title: "Current System Stock",
            dataIndex: "record",
            key: "record",
            align: "right",
            sorter: (a, b) => a.record - b.record,
        },
        {
            title: "Stock Difference",
            dataIndex: "changes",
            key: "changes",
            align: "right",
            sorter: (a, b) => a.changes - b.changes,
            sortDirections: ["ascend", "descend"],
            defaultSortOrder: "ascend" as SortOrder,
            render: (value: number) => {
                let color = token.colorTextSecondary;
                let icon = null;
                if (value > 0) {
                    color = token.colorSuccess;
                    icon = <ArrowUpOutlined />;
                } else if (value < 0) {
                    color = token.colorError;
                    icon = <ArrowDownOutlined />;
                }
                return (
                    <Space style={{ color, fontWeight: 500 }}>
                        {icon} {value.toFixed(2)}
                    </Space>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: "right",
            width: 60,
            render: (_: any, record) => (
                <Tooltip title="Edit">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: token.colorPrimary }} />}
                        onClick={() => handleOpenEdit(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <PageHeader
                icon={<AuditOutlined />}
                title={`Inventory Checking | ${today.format("DD/MM/YYYY")}`}
            />

            <Spin spinning={loading}>


                <Table
                    bordered
                    rowKey="materialId"
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                />
                <Flex justify="space-between" style={{ marginTop: 12 }}>
                    <div />
                    {data.length > 0 && (
                        <Button
                            type="primary"
                            loading={confirming}
                            onClick={handleConfirm}
                            icon={<CheckOutlined />}
                        >
                            Confirm
                        </Button>
                    )}
                </Flex>
            </Spin>

            <MaterialDetailModal
                open={modalOpen}
                onClose={handleCloseModal}
                recordId={selectedMaterialId}
            />

            <EditStockModal
                open={editOpen}
                record={editingRecord}
                onClose={() => setEditOpen(false)}
                onSave={handleSaveEdit}
            />
        </>
    );
}
