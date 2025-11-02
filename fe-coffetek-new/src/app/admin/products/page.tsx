'use client';
import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { productService } from "@/services/productService";
import type { Product, ProductImage } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    ProductDetailModal,
    DeleteProductModal,
    DeleteManyProductsModal,
    ProductTableActions,
} from "@/components/features/products";
import { formatCompactPriceProduct, formatPrice, formatPriceProduct, formatPriceRange } from "@/utils";
import { CategorySelector } from "@/components/features/categories";
import { useRouter } from 'next/navigation';
import { ProductTypeSelector } from "@/components/features/products/ProductTypeSelector";
import { Typography } from "antd";
import { PageHeader } from "@/components/layouts";
import { ShoppingOutlined } from "@ant-design/icons";
const { Title } = Typography;


export default function ProductPage() {
    const router = useRouter();
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [detailRecord, setDetailRecord] = useState<Product | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Product | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const isToppingParam = searchParams.get("isTopping");

        setTableState(prev => ({
            ...prev,
            isTopping: isToppingParam === "true" ? true : false,
        }));
    }, []);


    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await productService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                search: tableState.search,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "asc",
                categoryId: tableState.categoryId ? Number(tableState.categoryId) : undefined,
                isTopping: tableState.isTopping,
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

            <PageHeader icon={<ShoppingOutlined />} title="Product Management" />

            <TableToolbar
                search={tableState.search}
                onSearchChange={(value: string) => setTableState({ ...tableState, search: value })}
                filters={
                    <>
                        <ProductTypeSelector
                            value={tableState.isTopping === true}
                            onChange={(val) =>
                                setTableState({
                                    ...tableState,
                                    isTopping: val,
                                    currentPage: 1,
                                    categoryId: undefined,
                                })
                            }
                        />


                        {/* ✅ Nếu là product thì mới hiện category */}
                        {!tableState.isTopping && (
                            <CategorySelector
                                value={
                                    tableState.categoryId
                                        ? Number(tableState.categoryId)
                                        : null
                                }
                                onChange={(value) =>
                                    setTableState({
                                        ...tableState,
                                        categoryId: value,
                                        currentPage: 1,
                                    })
                                }
                            />
                        )}
                    </>
                }
                addHref="/admin/products/create"
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
                    {
                        title: "Category",
                        sorter: false,
                        render: (_: any, record: Product) => record.category?.name ?? "–",
                    },
                    {
                        title: "Price",
                        dataIndex: "price",
                        sorter: true,
                        render: (value: number | undefined, record: Product) =>
                            formatPriceProduct(record, { includeSymbol: true }),
                    },
                ]}

                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
                renderActions={(record) => (
                    <ProductTableActions
                        record={record}
                        onDetail={(record) => setDetailRecord(record)}
                        onEdit={(record) => router.push(`/admin/products/${record.id}/edit`)}
                        onDelete={(record) => setDeleteRecord(record)}
                        onRecipeClick={(record) => router.push(`/admin/products/${record.id}/recipe`)}
                    />
                )}
            />


            <ProductDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                recordId={detailRecord?.id}
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
