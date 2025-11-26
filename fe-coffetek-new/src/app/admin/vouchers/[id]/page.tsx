"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ 1. Import hooks điều hướng
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { voucherService } from "@/services/voucherService";
import type { Voucher } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    CreateVoucherModal,
    VoucherDetailModal,
    EditVoucherModal,
    DeleteVoucherModal,
    DeleteManyVouchersModal,
} from "@/components/features/vouchers";
import { PageHeader } from "@/components/layouts";
import { AppstoreOutlined, ArrowLeftOutlined } from "@ant-design/icons"; // ✅ Import icon
import { Tag, Button, message, Flex, Space, Typography } from "antd";
import dayjs from "dayjs";
import { formatPrice } from "@/utils";
const { Text, Title } = Typography;

export default function VoucherGroupDetailPage() {
    // ✅ 2. Lấy groupName từ URL
    const params = useParams();
    const router = useRouter();
    // Giải mã groupName từ URL (vì URL có thể chứa ký tự đặc biệt)
    const groupName = params?.id ? decodeURIComponent(params.id as string) : "";
    console.log("Viewing vouchers in group:", params?.id);
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Voucher[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [detailRecord, setDetailRecord] = useState<Voucher | null>(null);
    const [editRecord, setEditRecord] = useState<Voucher | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Voucher | null>(null);
    const [openDeleteManyModal, setOpenDeleteManyModal] = useState(false);

    // ✅ 3. Fetch data có filter theo groupName
    const fetchData = async () => {
        if (!groupName) return;

        setLoading(true);
        try {
            const res = await voucherService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.searchName,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "asc",
                groupName: groupName, // 👈 Lọc theo group
            });
            setData(res.data);
            setTotal(res.meta.total);
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch vouchers in this group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState, groupName]); // React khi groupName hoặc tableState thay đổi

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
        <div style={{ minHeight: "100vh" }}>

            <Flex
                align="center"
                justify="space-between"
                wrap
                style={{ marginBottom: 24 }}
            >
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => router.push("/admin/vouchers")}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        {`Vouchers: ${data.length > 0 ? data[0].voucher_name : 'N/A'}`}
                    </Title>
                </Space>
            </Flex>

            <TableToolbar
                search={tableState.searchName}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchName: value })
                }
                searchLabel="Search voucher in this group"
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add Voucher"
                onDeleteMany={selectedRowKeys.length > 0 ? handleDeleteMany : undefined}
                deleteManyLabel="Delete Selected"
            />

            <DataTable<Voucher>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    { title: "ID", dataIndex: "id", sorter: true, width: 80 },
                    {
                        title: "Code",
                        dataIndex: "code",
                        sorter: true,
                        render: (text) => <span className="font-mono font-medium">{text}</span>
                    },
                    {
                        title: "Voucher Name",
                        dataIndex: "voucher_name",
                        sorter: true
                    },
                    {
                        title: "Discount",
                        dataIndex: "discount_percentage",
                        render: (value) => <Tag color="success">{value}% OFF</Tag>,
                        sorter: true
                    },
                    {
                        title: "Min Order",
                        dataIndex: "minAmountOrder",
                        sorter: true,
                        render: (val) => formatPrice(val, { includeSymbol: true })
                    },
                    {
                        title: "Status",
                        dataIndex: "is_active",
                        render: (value: boolean, record) => {
                            // Logic hiển thị status chi tiết hơn
                            const now = dayjs();
                            const isExpired = dayjs(record.valid_to).isBefore(now);

                            if (isExpired) return <Tag color="error">Expired</Tag>;
                            if (!value) return <Tag color="default">Inactive</Tag>;
                            return <Tag color="success">Active</Tag>;
                        },
                        sorter: true,
                    },
                    {
                        title: "Expiry Date",
                        dataIndex: "valid_to",
                        render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
                        sorter: true
                    }
                ]}
                onDetail={(record) => setDetailRecord(record)}
                // onEdit={(record) => setEditRecord(record)} // Mở lại nếu cần edit
                onDelete={(record) => setDeleteRecord(record)}
                onRowSelectionChange={(selectedKeys) => setSelectedRowKeys(selectedKeys as number[])}
                enableRowSelection={true}
            />

            {/* CREATE - Lưu ý: Modal này hiện tại tạo mới, chưa tự động gán vào group hiện tại trừ khi Modal hỗ trợ prop groupName */}
            <CreateVoucherModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
                groupName={groupName}
                voucherName={data.length > 0 ? data[0].voucher_name : undefined}
                discount_percentage={data.length > 0 ? data[0].discount_percentage : undefined}
                minAmountOrder={data.length > 0 ? data[0].minAmountOrder : undefined}
                requirePoint={data.length > 0 ? data[0].requirePoint : undefined}
                valid_from={data.length > 0 ? data[0].valid_from : undefined}
                valid_to={data.length > 0 ? data[0].valid_to : undefined}
            />

            {/* DETAIL */}
            <VoucherDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                record={detailRecord}
            />

            {/* EDIT */}
            <EditVoucherModal
                open={!!editRecord}
                onClose={() => setEditRecord(null)}
                record={editRecord}
                onSuccess={fetchData}
            />

            {/* DELETE ONE */}
            <DeleteVoucherModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />

            {/* DELETE MANY */}
            <DeleteManyVouchersModal
                open={openDeleteManyModal}
                selectedRowKeys={selectedRowKeys}
                onClose={() => setOpenDeleteManyModal(false)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
        </div>
    );
}