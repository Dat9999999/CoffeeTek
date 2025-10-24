"use client";

import { useEffect, useState } from "react";
import { Modal, message, Button, Flex, Tooltip, Table, Typography, List, Card } from "antd";
import type { Material } from "@/interfaces";
import { materialService } from "@/services/materialService";
import { useTableState } from "@/hooks/useTableState";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { MaterialSearchSelector } from "./MaterialSearchSelector";

interface MaterialListSelectorProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (materialsNew: Material[]) => void;
    materialListCurrent: Material[];
}

const { Title } = Typography;


export function MaterialListSelector({
    open,
    onClose,
    onSuccess,
    materialListCurrent,
}: MaterialListSelectorProps) {
    const { tableState, setTableState } = useTableState();
    const [data, setData] = useState<Material[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [materialsNew, setMaterialsNew] = useState<Material[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    /** Fetch dữ liệu vật liệu */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res: any = await materialService.getAll({
                page: tableState.currentPage,
                size: tableState.pageSize,
                searchName: tableState.search,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "asc",
            });
            setData(res.data);
            setTotal(res.meta.total);
        } catch {
            message.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchData();
    }, [tableState, open]);

    /** Các id không được chọn lại */
    const disabledIds = new Set(materialListCurrent.map((m) => m.id));

    /** Khi chọn 1 material từ ô search */
    const handleSelectFromSearch = (material: Material | null) => {
        if (!material) return;
        if (disabledIds.has(material.id)) {
            message.warning("Material already selected");
            return;
        }

        setMaterialsNew((prev) => {
            if (prev.some((m) => m.id === material.id)) {
                // message.warning("Material already selected");
                return prev;
            }
            return [...prev, material];
        });

        setSelectedRowKeys((prev) =>
            prev.includes(material.id) ? prev : [...prev, material.id]
        );
    };


    /** Chọn/bỏ chọn trong bảng */
    const handleRowSelectionChange = (keys: React.Key[], selectedRows: Material[]) => {
        setSelectedRowKeys(keys);
        setMaterialsNew(selectedRows);
    };

    /** Khi click vào một hàng — toggle chọn/bỏ chọn */
    const handleRowClick = (record: Material) => {
        if (disabledIds.has(record.id)) return;
        const alreadySelected = selectedRowKeys.includes(record.id);
        const newKeys = alreadySelected
            ? selectedRowKeys.filter((k) => k !== record.id)
            : [...selectedRowKeys, record.id];

        const newSelected = alreadySelected
            ? materialsNew.filter((m) => m.id !== record.id)
            : [...materialsNew, record];

        setSelectedRowKeys(newKeys);
        setMaterialsNew(newSelected);
    };

    /** Lưu kết quả */
    const handleConfirm = () => {
        onSuccess(materialsNew);
        setMaterialsNew([]);
        setSelectedRowKeys([]);
        onClose();
    };

    /** Cấu hình rowSelection của AntD */
    const rowSelection = {
        selectedRowKeys,
        onChange: handleRowSelectionChange,
        getCheckboxProps: (record: Material) => ({
            disabled: disabledIds.has(record.id),
        }),
    };

    /** Cột hiển thị */
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text: string, record: Material) => (
                <span>{text}</span>
            ),
        },
        {
            title: "Unit",
            dataIndex: ["unit", "name"],
            render: (_: any, record: Material) => (
                <span>
                    {record.unit.name} ({record.unit.symbol})
                </span>
            ),
        },
        { title: "Code", dataIndex: "code" },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Select Materials"
            width={900}
            style={{ top: 20 }}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="ok" type="primary" onClick={handleConfirm}>
                    Add
                </Button>,
            ]}
        >
            <Flex vertical gap="small">
                {/* Search vật liệu */}
                <MaterialSearchSelector onSelect={handleSelectFromSearch} />

                {/* Bảng vật liệu */}
                <Table
                    style={{
                        marginTop: 30
                    }}
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    rowSelection={rowSelection}
                    pagination={{
                        current: tableState.currentPage,
                        pageSize: tableState.pageSize,
                        total: total,
                        showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}`,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "15", "20"],
                    }}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                    })}
                    rowClassName={(record) =>
                        disabledIds.has(record.id) ? "ant-table-row-disabled" : ""
                    }
                    scroll={data && data.length > 0 ? { x: "max-content" } : undefined}

                />

                {/* Danh sách vật liệu đã chọn */}
                {materialsNew.length > 0 && (
                    <>
                        <Title level={5}>Selected Materials:</Title>
                        <List
                            grid={{ gutter: 16, column: 3 }}
                            dataSource={materialsNew}
                            renderItem={(m) => (
                                <List.Item >
                                    <Card size="small">
                                        <span className="font-medium" >{m.name}</span> ({m.code})
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </>
                )}
            </Flex>
        </Modal>
    );
}