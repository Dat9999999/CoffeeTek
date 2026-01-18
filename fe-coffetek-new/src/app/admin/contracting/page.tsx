'use client';

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { contractingService, type Contracting } from "@/services/contractingService";
import { useTableState } from "@/hooks/useTableState";
import { PageHeader } from "@/components/layouts";
import { SolutionOutlined } from "@ant-design/icons";
import { DatePicker, message, Space, Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { MaterialSearchSelector } from "@/components/features/materials/MaterialSearchSelector";
import { UserSearchSelector } from "@/components/features/pos/UserSearchSelector";
import { Material, User } from "@/interfaces";
import { CreateContractingModal } from "@/components/features/contracting/CreateContractingModal";
import { EditContractingModal } from "@/components/features/contracting/EditContractingModal";
import { DeleteContractingModal } from "@/components/features/contracting/DeleteContractingModal";

export default function ContractingPage() {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Contracting[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [editRecord, setEditRecord] = useState<Contracting | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Contracting | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await contractingService.getAll({
                date: selectedDate ? selectedDate.toISOString() : undefined,
                materialId: selectedMaterial?.id,
                employeeId: selectedEmployee?.id,
                page: tableState.currentPage,
                size: tableState.pageSize,
            });
            setData(res.data);
            setTotal(res.meta.total);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to load contractings!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState, selectedDate, selectedMaterial, selectedEmployee]);

    const handleDeleteSuccess = (newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        setDeleteRecord(null);
    };

    return (
        <>
            <PageHeader icon={<SolutionOutlined />} title="Material Contracting" />
            
            <TableToolbar
                onAdd={() => setOpenAddModal(true)}
                addLabel="Add New"
                renderFilter={
                    <Space size="middle" wrap>
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date || null)}
                            format="DD/MM/YYYY"
                            style={{ width: 200 }}
                            placeholder="Select Date"
                            allowClear
                        />
                        <div style={{ width: 250 }}>
                            <MaterialSearchSelector
                                onSelect={(material) => setSelectedMaterial(material)}
                            />
                        </div>
                        <div style={{ width: 250 }}>
                            <UserSearchSelector
                                onSelect={(user) => setSelectedEmployee(user)}
                            />
                        </div>
                        {(selectedMaterial || selectedEmployee || selectedDate) && (
                            <Button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setSelectedMaterial(null);
                                    setSelectedEmployee(null);
                                }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Space>
                }
            />

            <DataTable<Contracting>
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
                        width: 80,
                    },
                    { 
                        title: "Material", 
                        dataIndex: ["Material", "name"],
                        render: (_, record) => record.Material?.name || "N/A",
                    },
                    { 
                        title: "Material Code", 
                        dataIndex: ["Material", "code"],
                        render: (_, record) => record.Material?.code || "N/A",
                    },
                    { 
                        title: "Quantity", 
                        dataIndex: "quantity",
                        sorter: true,
                        render: (value: number, record) => {
                            const unit = record.Material?.unit?.symbol || "";
                            return `${value} ${unit}`;
                        },
                    },
                    { 
                        title: "Created Date", 
                        dataIndex: "created_at",
                        sorter: true,
                        render: (value: string | Date) => {
                            return dayjs(value).format("DD/MM/YYYY HH:mm");
                        },
                    },
                    { 
                        title: "Employee", 
                        dataIndex: ["User", "last_name"],
                        render: (_, record) => {
                            if (record.User) {
                                return `${record.User.first_name} ${record.User.last_name}`;
                            }
                            return "N/A";
                        },
                    },
                ]}
                onEdit={(record) => setEditRecord(record)}
                onDelete={(record) => setDeleteRecord(record)}
                enableRowSelection={false}
            />

            {/* CREATE */}
            <CreateContractingModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSuccess={fetchData}
                defaultDate={selectedDate ? selectedDate.toDate() : new Date()}
            />

            {/* EDIT */}
            <EditContractingModal
                open={!!editRecord}
                contracting={editRecord}
                onClose={() => setEditRecord(null)}
                onSuccess={fetchData}
            />

            {/* DELETE */}
            <DeleteContractingModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={handleDeleteSuccess}
                totalItems={total}
                tableState={tableState}
            />
        </>
    );
}



