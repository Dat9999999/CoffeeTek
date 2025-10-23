'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { materialService } from "@/services/materialService";
import type { Material } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import { CreateMaterialModal, ImportMaterialButton, DeleteManyMaterialsModal, DeleteMaterialModal, EditMaterialModal, MaterialDetailModal } from "@/components/features/materials";

export default function MaterialPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Material[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

    const [openAddModal, setOpenAddModal] = useState(false);
    // placeholder cho phần còn lại
    const [detailRecord, setDetailRecord] = useState<Material | null>(null);
    const [editRecord, setEditRecord] = useState<Material | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Material | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: any = await materialService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.search,
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
            <h1>Material Management</h1>

            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, search: value })
                }
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
                buttonRights={<ImportMaterialButton />}
            />

            <DataTable<Material>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    { title: "Remain", dataIndex: "remain", sorter: true },
                    { title: "Code", dataIndex: "code", sorter: true },
                    { title: "Unit", dataIndex: ["unit", "name"] },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            {/* CREATE */}
            <CreateMaterialModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            {/* DETAIL - static */}
            <MaterialDetailModal open={!!detailRecord} record={detailRecord} onClose={() => setDetailRecord(null)} />

            {/* EDIT - static */}
            <EditMaterialModal open={!!editRecord} materialId={editRecord?.id} onClose={() => setEditRecord(null)} onSuccess={fetchData} />

            {/* DELETE ONE - static */}
            <DeleteMaterialModal open={!!deleteRecord} record={deleteRecord} onClose={() => setDeleteRecord(null)} onSuccess={handleDeleteSuccess} totalItems={total} tableState={tableState} />

            {/* DELETE MANY - static */}
            <DeleteManyMaterialsModal
                open={openDeleteManyModal}
                selectedRowKeys={selectedRowKeys}
                onClose={() => setOpenDeleteManyModal(false)}
                onSuccess={handleDeleteSuccess}
                totalItems={total} tableState={tableState}
            />
        </>
    );
}
