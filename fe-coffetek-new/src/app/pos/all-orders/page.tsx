// src/app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus, User } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    OrderDetailModal,
    OrderDeleteModal,
    OrderStatusModal,
    OrderTableActions,
    OrderStatusFilter,
} from "@/components/features/orders";
import { Tag, Typography } from "antd";
import dayjs from "dayjs";
import { formatPrice, getStatusColor } from "@/utils"; // Assuming you have a formatPrice utility
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layouts";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function OrderPosPage() {
    const router = useRouter();
    const { tableState, setTableState } = useTableState({ searchStatus: "" });
    const [data, setData] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    // const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [detailRecord, setDetailRecord] = useState<Order | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Order | null>(null);
    const [statusRecord, setStatusRecord] = useState<Order | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await orderService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.searchName,
                searchStatus: tableState.searchStatus,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "desc", // Newest first
            });
            setData(res.data);
            setTotal(res.meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState]);

    // const handleDeleteMany = () => setOpenDeleteManyModal(true);

    const handleSuccess = (isDeleteMany: boolean = false, newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        // if (isDeleteMany) setSelectedRowKeys([]);
        setDeleteRecord(null);
        setStatusRecord(null);
    };



    return (
        <div style={{ padding: 20, minHeight: "90vh" }}>
            {/* <PageHeader icon={<ShoppingCartOutlined />} title="Order Management" /> */}

            <TableToolbar
                searchLabel="Search by customer phone"
                search={tableState.searchName}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchName: value })
                }
                filters={
                    <OrderStatusFilter
                        value={tableState.searchStatus}
                        onChange={(value) =>
                            setTableState({ ...tableState, searchStatus: value, currentPage: 1 })
                        }
                    />
                }
                // addLabel="Create Order"
                // onAdd={() => router.push("/admin/orders/create")}
                deleteManyLabel="Delete Selected"
            />


            <DataTable<Order>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    {
                        title: "ID",
                        dataIndex: "id",
                        sorter: true,
                        width: 80,
                    },
                    {
                        title: "Created At",
                        dataIndex: "created_at",
                        sorter: true,
                        render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
                    },
                    {
                        title: "Order Processor",
                        dataIndex: "Staff",
                        sorter: false,
                        render: (staff: User) => (
                            <span>
                                {
                                    staff
                                        ? `${staff.first_name ?? ""} ${staff.last_name ?? ""} (${staff.phone_number ?? "N/A"})`
                                        : "N/A"
                                }
                            </span>
                        ),
                    },
                    {
                        title: "Customer Phone",
                        dataIndex: "customerPhone",
                        sorter: true,
                        render: (phone: string) => phone || <Text type="secondary">Guest</Text>,
                    },
                    {
                        title: "Final Price",
                        dataIndex: "final_price",
                        sorter: true,
                        render: (final_price: number) => formatPrice(final_price, { includeSymbol: true }),
                    },
                    {
                        title: "Status",
                        dataIndex: "status",
                        sorter: true,
                        render: (status: OrderStatus) => (
                            <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
                        ),
                    },
                ]}
                enableRowSelection={false}
                // onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                renderActions={(record) => (
                    <OrderTableActions
                        record={record}
                        onDetail={() => router.push(`/admin/orders/${record.id}/detail`)}
                        onEdit={(record: Order) => router.push(`/admin/orders/${record.id}/edit`)}
                        onDelete={setDeleteRecord}
                        onChangeStatus={setStatusRecord}
                    />
                )}
            />

            {/* Modals */}
            <OrderDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                order={detailRecord}
            />

            <OrderDeleteModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={() => handleSuccess()}
                totalItems={total}
                tableState={tableState}
            />


            <OrderStatusModal
                open={!!statusRecord}
                order={statusRecord}
                onClose={() => setStatusRecord(null)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}