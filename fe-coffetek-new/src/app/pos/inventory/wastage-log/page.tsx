'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { wastageLogService } from "@/services/wastageLogService";
import type { WastageLog, PaginatedResponse } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    CreateWastageLogModal,
    WastageLogDetailModal,
    EditWastageLogModal,
    DeleteWastageLogModal,
    DeleteManyWastageLogsModal,
} from "@/components/features/wastage-logs";
import { PageHeader } from "@/components/layouts";
import { DatePicker, Tag, Typography } from "antd"; // ✅ Thêm DatePicker
import { FallOutlined } from "@ant-design/icons";
import dayjs from 'dayjs'; // ✅ Thêm dayjs
import type { Dayjs } from 'dayjs'; // ✅ Thêm Dayjs

export default function InventoryWastageLogPage() {
    const { tableState, setTableState } = useTableState();
    // ✅ Thêm state cho ngày, mặc định là ngày hiện tại
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [data, setData] = useState<WastageLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<WastageLog | null>(null);
    const [editRecord, setEditRecord] = useState<WastageLog | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<WastageLog | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // ✅ Xây dựng params linh hoạt
            const params: {
                page: number;
                size: number;
                searchName?: string;
                orderBy: string;
                orderDirection: "asc" | "desc";
                date?: string;
            } = {
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.search,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "desc",
            };

            // ✅ Thêm 'date' vào params nếu nó được chọn
            if (selectedDate) {
                // Gửi định dạng YYYY-MM-DD, backend sẽ xử lý gte/lt
                params.date = selectedDate.format('YYYY-MM-DD');
            }

            const res: PaginatedResponse<WastageLog> = await wastageLogService.getAll(params);
            setData(res.data);
            setTotal(res.meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState, selectedDate]); // ✅ Thêm selectedDate vào dependency array

    const handleDeleteMany = () => setOpenDeleteManyModal(true);

    const handleDeleteSuccess = (isDeleteMany: boolean, newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        isDeleteMany ? setSelectedRowKeys([]) : setDeleteRecord(null);
    };

    const isToday = dayjs().isSame(selectedDate, 'day');
    console.log()
    return (
        <>
            <PageHeader
                icon={<FallOutlined />}
                title="Wastage Log"
            />

            <TableToolbar
                searchLabel="Search by material name"
                search={tableState.search}
                onSearchChange={(value: string) =>
                    // ✅ Reset về trang 1 khi tìm kiếm
                    setTableState({ ...tableState, search: value, currentPage: 1 })
                }
                // ✅ Thêm DatePicker vào vị trí 'filters' (bên trái)
                filters={
                    <DatePicker
                        allowClear // Cho phép xóa ngày (để xem tất cả)
                        value={selectedDate}
                        onChange={(date) => { // date là Dayjs | null
                            setSelectedDate(date);
                            // ✅ Reset về trang 1 khi đổi ngày
                            setTableState({ ...tableState, currentPage: 1 });
                        }}
                    />
                }
                onAdd={isToday ? () => setOpenAddModal(true) : undefined}
                addLabel="Add Log"

                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete"
            />

            <DataTable<WastageLog>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true },
                    {
                        title: "Material",
                        dataIndex: "materialId",
                        sorter: true,
                        render: (_, record) => record.Mateterial ? `${record.Mateterial?.name} (${record.Mateterial?.Unit.symbol})` : "N/A",
                    },
                    { title: "Quantity", dataIndex: "quantity", sorter: true },
                    {
                        title: "Reason",
                        dataIndex: "reason",
                        sorter: true,
                        width: 450,
                        render: (text) => (
                            <div style={{ width: 450 }}>
                                <Typography.Text
                                    ellipsis={{
                                        tooltip: true,
                                    }}
                                    style={{
                                        minWidth: 0
                                    }}>
                                    {text}
                                </Typography.Text>
                            </div>
                        ),
                    },
                    {
                        title: "Recorded By",
                        dataIndex: "userId",
                        sorter: false,
                        render: (_, record) => record.User?.first_name || "N/A",
                    },
                ]}
                onDetail={(record) => setDetailRecord(record)}

                onEdit={isToday ? (record) => setEditRecord(record) : undefined}

                onDelete={isToday ? (record) => setDeleteRecord(record) : undefined}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
                enableRowSelection={true}
            />

            {/* CREATE */}
            <CreateWastageLogModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
            />

            {/* DETAIL */}
            <WastageLogDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            {/* EDIT */}
            <EditWastageLogModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={fetchData}
            />

            {/* DELETE ONE */}
            <DeleteWastageLogModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            {/* DELETE MANY */}
            <DeleteManyWastageLogsModal
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

