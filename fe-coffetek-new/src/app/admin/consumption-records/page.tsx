"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { contractingService } from "@/services/contractingService";
import { PageHeader } from "@/components/layouts";
import { DatePicker, Tag, Typography, Card, Statistic, Row, Col, Modal, Table } from "antd";
import { ShoppingCartOutlined, DatabaseOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from 'dayjs';

const { Text } = Typography;

interface ConsumptionRecord {
    id: number;
    consumed: number;
    orderId: number;
    orderDetailId: number | null;
    date: string;
}

interface MaterialConsumption {
    materialId: number;
    materialName: string;
    materialCode: string;
    unit: string;
    totalConsumed: number;
    recordCount: number;
    orderCount: number;
    orderIds: number[];
    records: ConsumptionRecord[];
}

interface ConsumptionRecordsResponse {
    date: string;
    totalRecords: number;
    materials: MaterialConsumption[];
}

export default function ConsumptionRecordsPage() {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [data, setData] = useState<MaterialConsumption[]>([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<ConsumptionRecordsResponse | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<MaterialConsumption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        if (!selectedDate) return;
        
        setLoading(true);
        try {
            const res: ConsumptionRecordsResponse = await contractingService.getConsumptionRecords(
                selectedDate.format('YYYY-MM-DD')
            );
            setData(res.materials);
            setSummary(res);
        } catch (error) {
            console.error('Failed to fetch consumption records:', error);
            setData([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleViewDetails = (record: MaterialConsumption) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const columns = [
        {
            title: "Material Name",
            dataIndex: "materialName",
            key: "materialName",
            sorter: true,
        },
        {
            title: "Code",
            dataIndex: "materialCode",
            key: "materialCode",
        },
        {
            title: "Unit",
            dataIndex: "unit",
            key: "unit",
        },
        {
            title: "Total Consumed",
            dataIndex: "totalConsumed",
            key: "totalConsumed",
            sorter: true,
            render: (value: number, record: MaterialConsumption) => (
                <Text strong>{value.toFixed(2)} {record.unit}</Text>
            ),
        },
        {
            title: "Record Count",
            dataIndex: "recordCount",
            key: "recordCount",
            render: (value: number) => <Tag>{value}</Tag>,
        },
        {
            title: "Order Count",
            dataIndex: "orderCount",
            key: "orderCount",
            render: (value: number) => <Tag color="blue">{value} orders</Tag>,
        },
        {
            title: "Order IDs",
            dataIndex: "orderIds",
            key: "orderIds",
            render: (orderIds: number[]) => (
                <div style={{ maxWidth: 200 }}>
                    {orderIds.slice(0, 3).map((id) => (
                        <Tag key={id} style={{ marginBottom: 4 }}>
                            #{id}
                        </Tag>
                    ))}
                    {orderIds.length > 3 && (
                        <Tag>+{orderIds.length - 3} more</Tag>
                    )}
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: MaterialConsumption) => (
                <Tag 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewDetails(record)}
                    color="blue"
                >
                    View Details
                </Tag>
            ),
        },
    ];

    const detailColumns = [
        {
            title: "Order ID",
            dataIndex: "orderId",
            key: "orderId",
            render: (value: number) => <Tag>#{value}</Tag>,
        },
        {
            title: "Order Detail ID",
            dataIndex: "orderDetailId",
            key: "orderDetailId",
            render: (value: number | null) => 
                value ? <Tag color="default">#{value}</Tag> : <Text type="secondary">N/A</Text>,
        },
        {
            title: "Consumed",
            dataIndex: "consumed",
            key: "consumed",
            align: "right" as const,
            render: (value: number, record: ConsumptionRecord) => 
                `${value.toFixed(2)} ${selectedRecord?.unit || ''}`,
        },
    ];

    return (
        <>
            <PageHeader
                icon={<DatabaseOutlined />}
                title="Material Consumption Records"
            />
            
            <TableToolbar
                filters={
                    <DatePicker
                        format="DD-MM-YYYY"
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        style={{ width: 200 }}
                        allowClear={false}
                    />
                }
            />

            {/* Summary Statistics */}
            {summary && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total Records"
                                value={summary.totalRecords}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Materials Consumed"
                                value={summary.materials.length}
                                prefix={<DatabaseOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Date"
                                value={dayjs(summary.date).format('DD-MM-YYYY')}
                                prefix={<ShoppingCartOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <DataTable<MaterialConsumption>
                data={data}
                total={data.length}
                loading={loading}
                tableState={{
                    currentPage: 1,
                    pageSize: 10,
                    search: '',
                }}
                onChangeState={() => {}}
                columns={columns}
                enableRowSelection={false}
                isNoActions={true}
            />

            {!loading && data.length === 0 && selectedDate && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">
                        No consumption records found for {selectedDate.format('DD-MM-YYYY')}
                    </Text>
                </div>
            )}

            <Modal
                title={
                    <div>
                        <Text strong>Consumption Details: </Text>
                        <Text>{selectedRecord?.materialName} ({selectedRecord?.materialCode})</Text>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedRecord && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <Statistic
                                    title="Total Consumed"
                                    value={selectedRecord.totalConsumed}
                                    suffix={selectedRecord.unit}
                                    precision={2}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Record Count"
                                    value={selectedRecord.recordCount}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Order Count"
                                    value={selectedRecord.orderCount}
                                />
                            </Col>
                        </Row>
                        <Table
                            dataSource={selectedRecord.records}
                            columns={detailColumns}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                            }}
                            size="small"
                        />
                    </div>
                )}
            </Modal>
        </>
    );
}