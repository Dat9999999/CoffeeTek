'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { voucherService } from "@/services/voucherService";
import type { Voucher } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    CreateVoucherModal,
    VoucherDetailModal,
    EditVoucherModal,
    DeleteVoucherModal,
    DeleteManyVouchersModal,
} from "@/components/features/vouchers";
import { PageHeader } from "@/components/layouts";
import { GiftOutlined, IdcardOutlined } from "@ant-design/icons";
import { Tag } from "antd";

interface VoucherResponsePaging {
    data: Voucher[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
export default function VoucherPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Voucher[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Voucher | null>(null);
    const [editRecord, setEditRecord] = useState<Voucher | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Voucher | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: VoucherResponsePaging = await voucherService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.searchName,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "asc",
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

    const handleDeleteMany = () => setOpenDeleteManyModal(true);

    const handleDeleteSuccess = (isDeleteMany: boolean, newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        isDeleteMany ? setSelectedRowKeys([]) : setDeleteRecord(null);
    };

    return (
        <>
            <PageHeader icon={<IdcardOutlined />} title="Voucher Management" />

            <TableToolbar
                search={tableState.searchName}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchName: value })
                }
                searchLabel="Search by voucher code"
                onAdd={() => setOpenAddModal(true)}
                addLabel="Generate Voucher"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete Selected"
            />

            <DataTable<Voucher>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Code", dataIndex: "code", sorter: true },
                    { title: "Discount (%)", dataIndex: "discount_percentage", render: (value) => `${value}%`, sorter: true },
                    { title: "Min Order Amount", dataIndex: "minAmountOrder", sorter: true },
                    { title: "Required Points", dataIndex: "requirePoint", sorter: true },
                    {
                        title: "Status",
                        dataIndex: "is_active",
                        render: (value: boolean) => (
                            <Tag color={value ? "success" : "default"}>
                                {value ? "Active" : "Inactive"}
                            </Tag>
                        ),
                        sorter: true,
                    },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                // onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            {/* CREATE */}
            <CreateVoucherModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            {/* DETAIL */}
            <VoucherDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            {/* EDIT */}
            <EditVoucherModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={fetchData}
            />

            {/* DELETE ONE */}
            <DeleteVoucherModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            {/* DELETE MANY */}
            <DeleteManyVouchersModal
                open={openDeleteManyModal}
                selectedRowKeys={selectedRowKeys}
                onClose={() => setOpenDeleteManyModal(false)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
        </>
    );
}