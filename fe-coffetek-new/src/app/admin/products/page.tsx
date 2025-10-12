'use client';
import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { productService } from "@/services/productService";
import type { Product, ProductImage } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    CreateProductModal,
    ProductDetailModal,
    EditProductModal,
    DeleteProductModal,
    DeleteManyProductsModal
} from "@/components/features/products";
import { formatPrice } from "@/utils";

export default function ProductPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Product | null>(null);
    const [editRecord, setEditRecord] = useState<Product | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Product | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await productService.getAll({
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

    return (
        <>
            <h1>Product Management</h1>

            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) => setTableState({ ...tableState, search: value })}
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
            />

            <DataTable<Product>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    { title: "Category", dataIndex: ["category", "name"], sorter: false },
                    {
                        title: "Price",
                        dataIndex: "price",
                        sorter: true,
                        render: (value: number | undefined, record: Product) =>
                            record.is_multi_size
                                ? "Multi-size"
                                : formatPrice(value ?? 0, { includeSymbol: true }),
                    },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            <CreateProductModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={() => fetchData()}
            />

            <ProductDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            <EditProductModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={() => fetchData()}
            />

            <DeleteProductModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            <DeleteManyProductsModal
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
