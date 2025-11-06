"use client";

import {
    CategoryDistributionData,
    ProductStatData,
    reportService,
    TopNRevenueDto,
} from "@/services";
import { Bar, Pie } from "@ant-design/charts";
import {
    Alert,
    Card,
    Col,
    DatePicker,
    Empty,
    Row,
    Select,
    Space,
    Spin,
    Typography,
    theme,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * Component tiện ích để xử lý các trạng thái loading, error, và empty
 */
const ChartLoader = ({
    isLoading,
    error,
    data,
    children,
    height = 350, // Chiều cao mặc định
}: {
    isLoading: boolean;
    error: string | null;
    data: any[] | undefined | null;
    children: React.ReactNode;
    height?: number;
}) => {
    const containerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height,
    };

    if (isLoading)
        return (
            <div style={containerStyle}>
                <Spin tip="Loading data..." />
            </div>
        );
    if (error)
        return (
            <div style={containerStyle}>
                <Alert message="Unable to load data" description={error} type="error" showIcon />
            </div>
        );
    if (!data || data.length === 0)
        return (
            <div style={containerStyle}>
                <Empty description="No data to display" />
            </div>
        );
    return <>{children}</>;
};

/**
 * Chart 1: Biểu đồ Donut - Phân bổ Sản phẩm theo Danh mục
 * API: getProductDistributionByCategory (Không cần params)
 */
const ProductDistributionChart = () => {
    const [data, setData] = useState<CategoryDistributionData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = theme.useToken();

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getProductDistributionByCategory();
                setData(result);
            } catch (err: any) {
                console.error("Failed to fetch product distribution:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Tổng số sản phẩm
    const totalProducts = useMemo(() => {
        return data?.reduce((sum, item) => sum + item.count, 0) || 0;
    }, [data]);

    // ✅ Thêm phần trăm vào từng item
    const chartData = useMemo(() => {
        if (!data || totalProducts === 0) return [];
        return data
            .filter((item) => item.count > 0)
            .map((item) => ({
                ...item,
                percent: item.count / totalProducts,
            }));
    }, [data, totalProducts]);

    const config = {
        data: chartData,
        angleField: "count",
        colorField: "name",
        radius: 0.8,
        innerRadius: 0.6,
        minHeight: 500,
        label: {
            position: "spider",
            text: (d: any) => d.percent !== 0 ? `${(d.percent * 100).toFixed(1)}%` : "",
            layout: [
                { type: "overlap" }, // tránh chồng nhãn
                { type: "hide-overlap" }, // ẩn nhãn trống hoặc bị trùng
            ],
        },
        tooltip: {
            items: [
                {
                    channel: "colorField",
                    name: "Product",
                },
                {
                    channel: "y",
                    name: "Quantity",
                },
            ],
        },
        axis: {
            x: {
                line: { style: { lineWidth: 2, stroke: "#ddd" } },
                grid: {
                    line: {
                        style: {
                            stroke: "#f0f0f0",
                            lineWidth: 1,
                            lineDash: [4, 5],
                        },
                    },
                },
            },
            y: {
                line: { style: { lineWidth: 2, stroke: "#ddd" } },
                grid: {
                    line: {
                        style: {
                            stroke: "#f0f0f0",
                            lineWidth: 1,
                            lineDash: [4, 5],
                        },
                    },
                },
            },
        },
        statistic: {
            title: { text: "Total Products", style: { fontSize: 14 } },
            content: {
                text: totalProducts.toString(),
                style: { fontSize: 20, fontWeight: 500 },
            },
        },
        legend: {
            color: {
                title: false,
                position: "right",
                rowPadding: 5,
                itemName: {
                    style: { fill: token.colorText, fontSize: 13 },
                },
            },
        },
        annotations: [
            {
                type: "text",
                style: {
                    text: "Product Distribution by Category",
                    x: "50%",
                    y: "100%",
                    textAlign: "center",
                    fontSize: 14,
                    fill: "#8c8c8c",
                },
            },
        ],
    };

    return (
        <Card title="Product Distribution by Category">
            <ChartLoader isLoading={isLoading} error={error} data={chartData}>
                <Pie {...config} />
            </ChartLoader>
        </Card>
    );
};


/**
 * Chart 2: Biểu đồ Cột Ngang - Top N Sản phẩm Bán chạy
 * API: getTopNBestSellingProducts (Cần params: limit, startDate, endDate)
 */
const TopNBestSellingChart = ({ params }: { params: TopNRevenueDto }) => {
    const [data, setData] = useState<ProductStatData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params.startDate || !params.endDate) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getTopNBestSellingProducts(params);
                // Sắp xếp descending theo value để Top 1 (value cao nhất) ở đầu mảng
                const sorted = result.sort((a, b) => b.value - a.value);
                setData(sorted);
            } catch (err: any) {
                console.error("Failed to fetch best selling products:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [params]); // Fetch lại khi params (ngày, limit) thay đổi

    if (!data) {
        // ChartLoader sẽ xử lý, nhưng để an toàn
        return null;
    }

    // Format readable date range
    const formattedRange = `${dayjs(params.startDate).format("DD/MM/YYYY")} - ${dayjs(params.endDate).format("DD/MM/YYYY")}`;

    const chartTitle = `Top ${params.limit} Best Selling Products (${formattedRange})`;

    const config = {
        data,
        yField: "value", // Numerical field for horizontal bars
        xField: "name", // Categorical field for horizontal bars
        colorField: "name",
        minHeight: 500,
        boxSizing: "border-box",
        // paddingRight: 80,
        paddingBottom: "30px",
        style: {
            height: 30,
            maxWidth: 40,
        },
        tooltip: {
            items: [
                {
                    channel: "y",
                    name: "Product",
                },
                {
                    channel: "x",
                    name: "Sold Quantity",
                },
            ],
        },
        onReady: ({ chart }: any) => {
            chart.on(
                'afterrender',
                () => {
                    if (data && data.length > 0) {
                        chart.emit('element:select', {
                            data: { data: [data[0]] },
                        });
                    }
                },
                true,
            );
        },
        annotations: [
            {
                type: "text",
                style: {
                    text: chartTitle,
                    x: "50%",
                    y: "110%",
                    textAlign: "center",
                    fontSize: 14,
                    fill: "#8c8c8c",
                },
            },
        ],
    };

    // Chỉ truyền `data` vào ChartLoader (không phải data?.data)
    return (
        <ChartLoader isLoading={isLoading} error={error} data={data}>
            <Bar {...config} />
        </ChartLoader>
    );
};
/**
 * Component chính: Section Phân tích Sản phẩm
 * Bao gồm 2 biểu đồ và các bộ lọc
 */
export function ProductCharts() {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf("month"),
        dayjs().endOf("day"),
    ]);
    const [limit, setLimit] = useState<number>(5);

    // Params cho TopNBestSellingChart
    const topNParams: TopNRevenueDto = useMemo(
        () => ({
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
            limit: limit,
        }),
        [dateRange, limit],
    );

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    // Bộ lọc cho Card "Top Selling"
    const topSellingFilters = (
        <Space wrap size="middle">
            <Select
                value={limit}
                onChange={(value: any) => setLimit(value)}
                options={[
                    { value: 5, label: "Top 5" },
                    { value: 10, label: "Top 10" },
                    { value: 15, label: "Top 15" },
                ]}
                style={{ width: 100 }}
            />
            <RangePicker
                format={"DD-MM-YYYY"}
                value={dateRange}
                onChange={handleDateRangeChange}
                allowClear={false}
            />
        </Space>
    );

    return (
        <div style={{ marginTop: 24 }}>
            <Title level={4}>Product Analytics</Title>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {/* Biểu đồ Top Bán chạy (có filter) */}
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Products" extra={topSellingFilters}>
                        <TopNBestSellingChart params={topNParams} />
                    </Card>
                </Col>
                {/* Biểu đồ Phân bổ (tĩnh) */}
                <Col xs={24} lg={12}>
                    <ProductDistributionChart />
                </Col>


            </Row>
        </div>
    );
}