"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { userService } from "@/services/userService";
import type { User } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import { UserTableActions, UserLockModal, UserDetailModal, UserRoleModal } from "@/components/features/users";
import { Tag, Avatar, Typography, Badge } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export default function UserPage() {
    const { tableState, setTableState } = useTableState({ searchName: "" });
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [detailRecord, setDetailRecord] = useState<User | null>(null);
    const [roleRecord, setRoleRecord] = useState<User | null>(null);
    const [lockRecord, setLockRecord] = useState<User | null>(null);
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await userService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.searchName,
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
            <h1>User Management</h1>

            <TableToolbar
                search={tableState.searchName}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchName: value })
                }
                addLabel="Add"
                onAdd={() => { }}
            />

            <DataTable<User>
                data={data}
                total={total}
                loading={loading}
                tableState={tableState}
                onChangeState={setTableState}
                columns={[
                    {
                        title: "ID",
                        dataIndex: "id",
                        sorter: true,
                        width: 50,
                    },
                    {
                        title: "Avatar",
                        dataIndex: ["detail", "avatar_url"],
                        align: "center",
                        render: (_, record) => {
                            const url = record.detail?.avatar_url;
                            return (
                                <Avatar
                                    src={url ? `${baseUrl}/${url}` : "/default-avatar.png"}
                                    size={40}
                                />
                            );
                        },
                        width: "7rem",
                    },
                    {
                        title: "First Name",
                        dataIndex: ["first_name"],
                        sorter: true,
                        render: (text: string) => text || <Text type="secondary">N/A</Text>,
                    },
                    {
                        title: "Last Name",
                        dataIndex: ["last_name"],
                        sorter: true,
                        render: (text: string) => text || <Text type="secondary">N/A</Text>,
                    },
                    {
                        title: "Phone Number",
                        dataIndex: "phone_number",
                        sorter: true,
                    },
                    {
                        title: "Sex",
                        dataIndex: ["detail", "sex"],
                        render: (sex: string) => {
                            const color =
                                sex === "male"
                                    ? "blue"
                                    : sex === "female"
                                        ? "pink"
                                        : "default";
                            return <Tag color={color}>{sex || "unknown"}</Tag>;
                        },
                    },
                    {
                        title: "Status",
                        dataIndex: "is_locked",
                        render: (isLocked: boolean) =>
                            isLocked ? (
                                <Tag color="error">Locked</Tag>
                            ) : (
                                <Tag color="success">Active</Tag>
                            ),

                        onFilter: (value, record) =>
                            record.is_locked === (value === "true" || value === true),
                        width: "8rem",
                    }
                ]}
                enableRowSelection={false}
                renderActions={(record) => (
                    <UserTableActions
                        record={record}
                        onDetail={setDetailRecord}
                        onLock={setLockRecord}
                        onUnlock={setLockRecord}
                        onEditRole={setRoleRecord}
                    />
                )}
            />

            {/* DETAIL MODAL */}
            <UserDetailModal
                open={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                user={detailRecord}
            />

            {/* LOCK/UNLOCK MODAL */}
            <UserLockModal
                open={!!lockRecord}
                onClose={() => setLockRecord(null)}
                user={lockRecord}
                onSuccess={fetchData}
            />

            {/* ROLE MODAL */}
            <UserRoleModal
                open={!!roleRecord}
                onClose={() => setRoleRecord(null)}
                user={roleRecord}
                onSuccess={fetchData}
            />
        </>
    );
}
