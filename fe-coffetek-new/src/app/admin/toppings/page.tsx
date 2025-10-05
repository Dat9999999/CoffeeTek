'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { toppingService } from "@/services/toppingService";
import type { Topping, ToppingResponsePaging } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import { CreateToppingModal, ToppingDetailModal, EditToppingModal, DeleteToppingModal } from "@/components/features/toppings";

export default function ToppingPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Topping[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Topping | null>(null);
    const [editRecord, setEditRecord] = useState<Topping | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Topping | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: ToppingResponsePaging = await toppingService.getAll({
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

    return (
        <>
            <h1>Topping Management</h1>

            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, search: value })
                }
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add Topping"
            />

            <DataTable<Topping>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    { title: "Price", dataIndex: "price", sorter: true },
                    { title: "Image Name", dataIndex: "image_name", sorter: true },
                    { title: "Sort Index", dataIndex: "sort_index", sorter: true },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
            />

            <CreateToppingModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={() => fetchData()}
            />

            <ToppingDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            <EditToppingModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={() => fetchData()}
            />

            <DeleteToppingModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={fetchData}
            />
        </>
    );
}