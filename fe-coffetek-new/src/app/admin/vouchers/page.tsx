'use client';

import { useEffect, useState } from "react";
// 1. Import useRouter
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { VoucherGroup, voucherService } from "@/services/voucherService";
import type { PaginatedResponse } from "@/interfaces/types";
import { useTableState } from "@/hooks/useTableState";
import { CreateVoucherModal } from "@/components/features/vouchers";
import { DeleteVoucherGroupModal } from "@/components/features/vouchers/DeleteVoucherGroupModal";
import { DeleteManyVoucherGroupsModal } from "@/components/features/vouchers/DeleteManyVoucherGroupsModal";
import { PageHeader } from "@/components/layouts";
import { GiftOutlined } from "@ant-design/icons";
import { Tag, message, Tooltip, Progress } from "antd";
import dayjs from "dayjs";
import { VoucherTableActions } from "@/components/features/vouchers/VoucherTableActions";

export default function VoucherPage() {
    // 2. Khởi tạo Router
    const router = useRouter();

    const { tableState, setTableState } = useTableState();

    const [data, setData] = useState<VoucherGroup[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState<VoucherGroup | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: PaginatedResponse<VoucherGroup> = await voucherService.getGroups({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.searchName,
                orderBy: tableState.orderBy || "valid_to",
                orderDirection: tableState.orderDirection || "desc",
            });

            setData(res.data);
            setTotal(res.meta.total);
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch voucher groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState]);

    const handleDeleteSuccess = (isDeleteMany: boolean, newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        if (isDeleteMany) {
            setSelectedRowKeys([]);
            setOpenDeleteManyModal(false);
        } else {
            setDeleteRecord(null);
        }
    };

    const validSelectedKeys = selectedRowKeys.filter(key =>
        typeof key === 'string' && !key.startsWith('unknown_')
    );

    // Hàm xử lý chuyển trang detail
    const handleViewDetail = (record: VoucherGroup) => {
        // if (record.group_name) {
        //     // Chuyển hướng đến trang chi tiết, ví dụ: /voucher/DETAIL_CODE_123
        //     // encodeURIComponent để đảm bảo URL an toàn nếu mã có ký tự đặc biệt
        //     router.push(`/admin/vouchers/${encodeURIComponent(record.group_name)}`);
        // } else {
        //     message.warning("Cannot view detail for ungrouped vouchers");
        // }
        router.push(`/admin/vouchers/${encodeURIComponent(record.group_name)}`);
    };

    return (
        <>
            <PageHeader icon={<GiftOutlined />} title="Voucher Campaigns" />

            <TableToolbar
                search={tableState.searchName}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchName: value })
                }
                searchLabel="Search by group or voucher name"
                onAdd={() => setOpenAddModal(true)}
                addLabel="Create Campaign"
                onDeleteMany={validSelectedKeys.length > 0 ? () => setOpenDeleteManyModal(true) : undefined}
                deleteManyLabel="Delete"
            />

            <DataTable<VoucherGroup>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                rowKey={(record: VoucherGroup) => record.group_name}

                columns={[
                    {
                        title: "Group Code",
                        dataIndex: "group_name",
                        sorter: true,
                        hidden: true,
                        render: (text, record) => text
                            // Thêm onClick vào tên group để tiện click luôn
                            ? <span
                                className="font-semibold text-blue-600 cursor-pointer hover:underline"
                                onClick={() => handleViewDetail(record)}
                            >
                                {text}
                            </span>
                            : <span className="text-gray-400 italic">N/A (No Group)</span>
                    },
                    // ... (Giữ nguyên các cột khác)
                    {
                        title: "Voucher Name",
                        dataIndex: "voucher_name",
                        sorter: true,
                        render: (text, record) => (text && text !== "empty" && record.group_name !== null)
                            ? text
                            : <span className="text-gray-400 italic">N/A (No Group)</span>
                    },
                    {
                        title: "Discount",
                        dataIndex: "discount_percentage",
                        render: (value) => <Tag color="success">{value}% OFF</Tag>,
                        sorter: true
                    },
                    {
                        title: "Usage Stats",
                        dataIndex: "total",
                        width: 180,
                        render: (total, record) => {
                            const percent = total > 0 ? Math.round((record.active / total) * 100) : 0;
                            return (
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Total: <b>{total}</b></span>
                                        <span className="text-green-600">Active: {record.active}</span>
                                    </div>
                                    <Tooltip title={`${record.active} Active / ${record.inactive} Inactive`}>
                                        <Progress percent={percent} size="small" showInfo={false} status="active" strokeColor="#10b981" />
                                    </Tooltip>
                                </div>
                            )
                        }
                    },
                    {
                        title: "Start Date",
                        dataIndex: "valid_from",
                        width: 120,
                        render: (date) => {
                            if (!date) return "N/A";
                            const isFuture = dayjs(date).isAfter(dayjs());
                            return (
                                <span className={isFuture ? "text-orange-500 font-medium" : ""}>
                                    {dayjs(date).format("DD/MM/YYYY")}
                                </span>
                            );
                        },
                        sorter: true,
                    },
                    {
                        title: "End Date",
                        dataIndex: "valid_to",
                        width: 120,
                        render: (date) => {
                            if (!date) return "N/A";
                            const isExpired = dayjs(date).isBefore(dayjs());
                            return (
                                <span className={isExpired ? "text-red-500 font-medium" : ""}>
                                    {dayjs(date).format("DD/MM/YYYY")}
                                </span>
                            );
                        },
                        sorter: true,
                    },
                    {
                        title: "Status",
                        key: "status",
                        width: 120,
                        render: (_, record) => {
                            const now = dayjs();
                            const startDate = record.valid_from ? dayjs(record.valid_from) : null;
                            const endDate = record.valid_to ? dayjs(record.valid_to) : null;

                            if (endDate && endDate.isBefore(now)) return <Tag color="error">Expired</Tag>;
                            if (startDate && startDate.isAfter(now)) return <Tag color="warning">Scheduled</Tag>;
                            if (record.active === 0) return <Tag color="default">Out of Stock</Tag>;

                            return <Tag color="success">Running</Tag>;
                        },
                    },
                ]}

                // --- 3. TRUYỀN ONDETAIL VÀO ACTIONS ---
                renderActions={(record) => (
                    <VoucherTableActions
                        record={record}
                        onDelete={(r) => setDeleteRecord(r)}
                        // Thêm sự kiện View Detail
                        onDetail={(r) => handleViewDetail(r)}
                    />
                )}

                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            <CreateVoucherModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            <DeleteVoucherGroupModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            <DeleteManyVoucherGroupsModal
                open={openDeleteManyModal}
                selectedGroupNames={validSelectedKeys}
                onClose={() => setOpenDeleteManyModal(false)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
        </>
    );
}