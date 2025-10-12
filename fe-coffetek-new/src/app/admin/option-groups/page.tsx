'use client';
import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { optionGroupService } from "@/services/optionGroupService";
import type { OptionGroup, OptionGroupResponsePaging } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import { CreateOptionGroupModal, OptionGroupDetailModal, EditOptionGroupModal, DeleteOptionGroupModal, DeleteManyOptionGroupsModal } from "@/components/features/option-groups";

export default function OptionGroupPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<OptionGroup[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<OptionGroup | null>(null);
    const [editRecord, setEditRecord] = useState<OptionGroup | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<OptionGroup | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: OptionGroupResponsePaging = await optionGroupService.getAll({
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

    const handleDeleteMany = () => {
        setOpenDeleteManyModal(true);
    };

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
            <h1>Option Group Management</h1>
            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, search: value })
                }
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
            />
            <DataTable<OptionGroup>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />
            <CreateOptionGroupModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={() => fetchData()}
            />
            <OptionGroupDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                id={detailRecord?.id}
            />
            <EditOptionGroupModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={() => fetchData()}
            />
            <DeleteOptionGroupModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
            <DeleteManyOptionGroupsModal
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