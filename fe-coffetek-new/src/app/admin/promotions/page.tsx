'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { promotionService } from "@/services/promotionService";
import type { Promotion } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    CreatePromotionModal,
    PromotionDetailModal,
    EditPromotionModal,
    DeletePromotionModal,
    DeleteManyPromotionsModal,
} from "@/components/features/promotions";
import { PageHeader } from "@/components/layouts";
import { GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Tag } from "antd";
import { useRouter } from "next/navigation";

interface PromotionResponsePaging {
    data: Promotion[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
export default function PromotionPage() {
    const router = useRouter();
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Promotion[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);


    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Promotion | null>(null);
    const [editRecord, setEditRecord] = useState<Promotion | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Promotion | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: PromotionResponsePaging = await promotionService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                search: tableState.search,
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

    const handleDetailClick = (record: Promotion) => {
        router.push(`/admin/promotions/${record.id}/detail`);
    }

    const handleEditClick = (record: Promotion) => {
        router.push(`/admin/promotions/${record.id}/edit`);
    }

    return (
        <>
            <PageHeader icon={<GiftOutlined />} title="Promotion Management" />

            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, search: value })
                }
                onAdd={() => router.push("/admin/promotions/create")}
                addLabel="Add"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
            />

            <DataTable<Promotion>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    { title: "Description", dataIndex: "description" },
                    {
                        title: "Valid Period",
                        key: "validPeriod",
                        render: (record) => {
                            const start = record.start_date
                                ? dayjs(record.start_date).format("DD-MM-YYYY")
                                : "-";
                            const end = record.end_date
                                ? dayjs(record.end_date).format("DD-MM-YYYY")
                                : "-";
                            return `${start} → ${end}`;
                        },
                    },
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
                onDetail={(record) => handleDetailClick(record)}
                onEdit={(record) => handleEditClick(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            {/* CREATE */}
            <CreatePromotionModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            {/* DETAIL */}
            <PromotionDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            {/* EDIT */}
            <EditPromotionModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={fetchData}
            />

            {/* DELETE ONE */}
            <DeletePromotionModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            {/* DELETE MANY */}
            <DeleteManyPromotionsModal
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