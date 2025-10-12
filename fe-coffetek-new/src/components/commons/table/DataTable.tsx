'use client';

import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig, SorterResult } from "antd/es/table/interface";
import { TableActions } from "./TableActions";
import { TableState } from "@/hooks/useTableState";

interface DataTableProps<T> {
    data: T[];
    total: number;
    loading: boolean;
    columns: ColumnsType<T>;
    tableState: TableState;
    onChangeState: (state: TableState) => void;
    enableSearch?: boolean;
    enableCreate?: boolean;
    renderFilter?: React.ReactNode;
    onDetail?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onRowSelectionChange?: (selectedRowKeys: number[]) => void;
    enableRowSelection?: boolean; // Thêm prop mới để bật/tắt rowSelection
}

export function DataTable<T extends { id: number | string }>({
    data,
    total,
    loading,
    columns,
    tableState,
    onChangeState,
    onDetail,
    onEdit,
    onDelete,
    onRowSelectionChange,
    enableRowSelection = false, // Mặc định tắt rowSelection
}: DataTableProps<T>) {
    const handleChange = (
        newPagination: TablePaginationConfig,
        _: any,
        sorterParam: SorterResult<T> | SorterResult<T>[]
    ) => {
        const newState: TableState = {
            ...tableState,
            currentPage: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
        };

        if (!Array.isArray(sorterParam)) {
            newState.orderBy = sorterParam.field as string;
            newState.orderDirection =
                sorterParam.order === "ascend"
                    ? "asc"
                    : sorterParam.order === "descend"
                        ? "desc"
                        : undefined;
        }

        onChangeState(newState);
    };

    return (
        <Table<T>
            rowKey="id"
            rowSelection={
                enableRowSelection
                    ? {
                        type: "checkbox",
                        onChange: (selectedRowKeys) => {
                            onRowSelectionChange?.(selectedRowKeys as number[]);
                        },
                    }
                    : undefined
            }
            columns={[
                ...columns,
                {
                    title: "Actions",
                    key: "actions",
                    width: 40,
                    fixed: "right",
                    align: "center",
                    render: (_, record) => (
                        <TableActions
                            record={record}
                            onDetail={onDetail}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ),
                },
            ]}
            dataSource={data}
            loading={loading}
            pagination={{
                current: tableState.currentPage,
                pageSize: tableState.pageSize,
                total: total,
                showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}`,
                showSizeChanger: true,
                pageSizeOptions: ["10", "15", "20"],
            }}
            onChange={handleChange}
            scroll={data && data.length > 0 ? { x: "max-content" } : undefined}
        />
    );
}