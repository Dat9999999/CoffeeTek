'use client';
import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { categoryService, GetAllCategoriesParams } from "@/services/categoryService";
import type { Category, CategoryResponsePaging } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import { CreateCategoryModal, CategoryDetailModal, EditCategoryModal, DeleteCategoryModal, DeleteManyCategoriesModal } from "@/components/features/categories";
import { Tabs } from 'antd';
import { PageHeader } from "@/components/layouts";
import { TagsOutlined } from "@ant-design/icons";

export default function CategoryPage() {
    const { tableState, setTableState } = useTableState({ filterType: 'all' });
    const [data, setData] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Category | null>(null);
    const [editRecord, setEditRecord] = useState<Category | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Category | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: GetAllCategoriesParams = {
                page: tableState.currentPage,
                size: tableState.pageSize,
                search: tableState.search,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "asc",
            };
            if (tableState.filterType === 'parent') {
                params.isParentCategory = true;
            } else if (tableState.filterType === 'child') {
                params.isParentCategory = false;
            }
            const res: CategoryResponsePaging = await categoryService.getAll(params);
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
            <PageHeader icon={<TagsOutlined />} title="Category Management" />
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
            <Tabs
                activeKey={tableState.filterType}
                onChange={(key) => setTableState({ ...tableState, filterType: key, currentPage: 1 })}
                items={[
                    { key: 'all', label: 'All' },
                    { key: 'parent', label: 'Parent' },
                    { key: 'child', label: 'Sub' },
                ]}
            />
            <DataTable<Category>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    { title: "Name", dataIndex: "name", sorter: true },
                    // {
                    //     title: "Is Parent Category",
                    //     dataIndex: "is_parent_category",
                    //     sorter: true,
                    //     render: (value: boolean) => (value ? "Yes" : "No"),
                    // },
                    // {
                    //     title: "Parent Category ID",
                    //     dataIndex: "parent_category_id",
                    //     sorter: true,
                    //     render: (value: number | null) => value ?? "N/A",
                    // },
                ]}
                onDetail={(record) => setDetailRecord(record)}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />
            <CreateCategoryModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={() => fetchData()}
            />
            <CategoryDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />
            <EditCategoryModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={() => fetchData()}
            />
            <DeleteCategoryModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
            <DeleteManyCategoriesModal
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