"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/commons/table/DataTable";
import { TableToolbar } from "@/components/commons/table/TableToolbar";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus, User } from "@/interfaces";
import { useTableState } from "@/hooks/useTableState";
import {
    OrderDeleteModal,
    OrderStatusModal,
    OrderTableActions,
    OrderStatusFilter,
} from "@/components/features/orders";
import { Tag, Typography, Row, Col, Statistic, DatePicker, Card, Divider } from "antd";
import dayjs from "dayjs";
import {
    countUpFormatter,
    formatPrice,
    getPriceSymbol,
    getStatusColor,
} from "@/utils";
import { useRouter } from "next/navigation";
import { ControlOutlined, ReconciliationOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { OrderDetailComponent } from "@/components/features/orders/OrderDetailComponent";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function OrderPosPage() {
    const router = useRouter();

    // ✅ Mặc định là ngày hôm nay
    const today = dayjs().format("DD-MM-YYYY");

    const { tableState, setTableState } = useTableState({
        searchCustomerPhone: "",
        searchStatuses: "",
        searchFromDate: today,
        searchToDate: today,
    });

    const [data, setData] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState<any>(null);

    // ✅ record đang xem chi tiết (nếu có)
    const [detailRecord, setDetailRecord] = useState<Order | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<Order | null>(null);
    const [statusRecord, setStatusRecord] = useState<Order | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: tableState.currentPage,
                size: tableState.pageSize,
                orderBy: tableState.orderBy || "id",
                orderDirection: tableState.orderDirection || "desc",
            };

            if (tableState.searchCustomerPhone) {
                params.searchCustomerPhone = tableState.searchCustomerPhone;
            }
            if (tableState.searchStatuses) {
                params.searchStatuses = tableState.searchStatuses;
            }
            if (tableState.searchFromDate) {
                params.searchFromDate = dayjs(
                    tableState.searchFromDate,
                    "DD-MM-YYYY"
                ).format("YYYY-MM-DD");
            }
            if (tableState.searchToDate) {
                params.searchToDate = dayjs(
                    tableState.searchToDate,
                    "DD-MM-YYYY"
                ).format("YYYY-MM-DD");
            }

            const res = await orderService.getAll(params);
            setData(res.data);
            setTotal(res.meta.total);
            setMeta(res.meta);
            setDetailRecord(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableState]);

    const handleSuccess = (isDeleteMany: boolean = false, newPage?: number) => {
        if (newPage && newPage !== tableState.currentPage) {
            setTableState({ ...tableState, currentPage: newPage });
        } else {
            fetchData();
        }
        setDeleteRecord(null);
        setStatusRecord(null);
    };

    const handleDateChange = (dates: any, dateStrings: [string, string]) => {
        setTableState({
            ...tableState,
            searchFromDate: dateStrings[0],
            searchToDate: dateStrings[1],
            currentPage: 1,
        });
    };

    return (
        <div style={{ padding: 10 }}>
            {/* ==== THỐNG KÊ ==== */}
            {meta && (
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Card>
                            <Statistic
                                title="Total Orders"
                                value={meta.total}
                                formatter={countUpFormatter}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Card>
                            <Statistic
                                title="Total Revenue"
                                value={meta.totalRevenue}
                                formatter={countUpFormatter}
                                suffix={getPriceSymbol()}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Card>
                            <Statistic
                                title="Total Discount"
                                value={meta.totalDiscount}
                                formatter={countUpFormatter}
                                suffix={getPriceSymbol()}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Card>
                            <Statistic
                                title="Average Order Value"
                                value={meta.averageOrderValue}
                                formatter={countUpFormatter}
                                suffix={getPriceSymbol()}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* ==== THANH TÌM KIẾM ==== */}
            <TableToolbar
                searchLabel="Search by customer phone"
                search={tableState.searchCustomerPhone}
                onSearchChange={(value: string) =>
                    setTableState({ ...tableState, searchCustomerPhone: value })
                }
                filters={
                    <>
                        <OrderStatusFilter
                            value={tableState.searchStatuses}
                            onChange={(value) =>
                                setTableState({
                                    ...tableState,
                                    searchStatuses: value,
                                    currentPage: 1,
                                })
                            }
                        />
                        <RangePicker
                            format="DD-MM-YYYY"
                            onChange={handleDateChange}
                            style={{ marginLeft: 8 }}
                            placeholder={["From Date", "To Date"]}
                            value={[
                                dayjs(tableState.searchFromDate, "DD-MM-YYYY"),
                                dayjs(tableState.searchToDate, "DD-MM-YYYY"),
                            ]}
                        />
                    </>
                }
            />

            {/* ==== BẢNG DỮ LIỆU ==== */}
            <DataTable<Order>
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
                        title: "Created At",
                        dataIndex: "created_at",
                        sorter: true,
                        render: (date: string) =>
                            dayjs(date).format("YYYY-MM-DD HH:mm"),
                    },
                    {
                        title: "Order Processor",
                        dataIndex: "Staff",
                        sorter: false,
                        render: (staff: User) => (
                            <span>
                                {staff
                                    ? `${staff.first_name ?? ""} ${staff.last_name ?? ""} (${staff.phone_number ?? "N/A"
                                    })`
                                    : "N/A"}
                            </span>
                        ),
                    },
                    {
                        title: "Customer Phone",
                        dataIndex: "customerPhone",
                        sorter: true,
                        render: (phone: string) =>
                            phone || <Text type="secondary">Guest</Text>,
                    },
                    {
                        title: "Final Price",
                        dataIndex: "final_price",
                        sorter: true,
                        render: (final_price: number) =>
                            formatPrice(final_price, { includeSymbol: true }),
                    },
                    {
                        title: "Status",
                        dataIndex: "status",
                        sorter: true,
                        render: (status: OrderStatus) => (
                            <Tag color={getStatusColor(status)}>
                                {status.toUpperCase()}
                            </Tag>
                        ),
                    },
                ]}
                enableRowSelection={false}
                renderActions={(record) => (
                    <OrderTableActions
                        record={record}
                        onDetail={() =>
                            setDetailRecord(
                                detailRecord?.id === record.id ? null : record
                            )
                        }
                    />
                )}
            />

            {/* ==== PHẦN CHI TIẾT DƯỚI BẢNG ==== */}
            {detailRecord && (
                <>
                    <Divider />
                    <OrderDetailComponent
                        activeConfirmButton={false}
                        header={null}
                        orderId={detailRecord.id}
                        onStatusUpdate={() => fetchData()}
                    />
                </>
            )}

            {/* ==== MODALS ==== */}
            <OrderDeleteModal
                open={!!deleteRecord}
                record={deleteRecord}
                onClose={() => setDeleteRecord(null)}
                onSuccess={() => handleSuccess()}
                totalItems={total}
                tableState={tableState}
            />

            <OrderStatusModal
                open={!!statusRecord}
                order={statusRecord}
                onClose={() => setStatusRecord(null)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
