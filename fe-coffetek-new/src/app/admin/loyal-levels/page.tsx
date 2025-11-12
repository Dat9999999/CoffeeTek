// app/loyal-level/page.tsx or wherever the page is
'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { loyalLevelService } from "@/services/loyalLevelService";
import type { LoyalLevel } from "@/interfaces";
import {
    CreateLoyalLevelModal,
    LoyalLevelDetailModal,
    EditLoyalLevelModal,
    DeleteLoyalLevelModal,
    DeleteManyLoyalLevelsModal,
} from "@/components/features/loyal-levels";
import { PageHeader } from "@/components/layouts";
import { CrownOutlined, SlidersOutlined } from "@ant-design/icons";

export default function LoyalLevelPage() {
    const [search, setSearch] = useState<string>("");
    const [orderBy, setOrderBy] = useState<string | undefined>("id");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc" | undefined>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(0); // Will be set to data.length

    const [data, setData] = useState<LoyalLevel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<LoyalLevel | null>(null);
    const [editRecord, setEditRecord] = useState<LoyalLevel | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<LoyalLevel | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const tableState = {
        currentPage,
        pageSize,
        orderBy,
        orderDirection,
        search,
    };

    const setTableState = (newState: Partial<typeof tableState>) => {
        if (newState.currentPage !== undefined) setCurrentPage(newState.currentPage);
        if (newState.pageSize !== undefined) setPageSize(newState.pageSize);
        if (newState.orderBy !== undefined) setOrderBy(newState.orderBy);
        if (newState.orderDirection !== undefined) setOrderDirection(newState.orderDirection);
        if (newState.search !== undefined) setSearch(newState.search);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: LoyalLevel[] = await loyalLevelService.getAll({
                search: search,
                orderBy: orderBy || "id",
                orderDirection: orderDirection || "asc",
            });
            setData(res);
            setTotal(res.length);
            setCurrentPage(1);
            setPageSize(res.length);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, orderBy, orderDirection]);

    const handleDeleteMany = () => setOpenDeleteManyModal(true);

    const handleDeleteSuccess = (isDeleteMany: boolean, newPage?: number) => {
        if (newPage && newPage !== currentPage) {
            setCurrentPage(newPage);
        } else {
            fetchData();
        }
        isDeleteMany ? setSelectedRowKeys([]) : setDeleteRecord(null);
    };

    return (
        <>
            <PageHeader icon={<CrownOutlined />} title="Loyal Level Management" />

            <TableToolbar
                search={search}
                onSearchChange={(value: string) => setSearch(value)}
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
            />

            <DataTable<LoyalLevel>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    { title: "Require Point", dataIndex: "required_points", sorter: true },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
                showPaging={false}
            />

            {/* CREATE */}
            <CreateLoyalLevelModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            {/* DETAIL */}
            <LoyalLevelDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            {/* EDIT */}
            <EditLoyalLevelModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={fetchData}
            />

            {/* DELETE ONE */}
            <DeleteLoyalLevelModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            {/* DELETE MANY */}
            <DeleteManyLoyalLevelsModal
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