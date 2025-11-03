"use client";

import {
    reportService,
    RevenueByDayData,
    RevenueByMonthData,
    // 🔥 [MỚI] Import các type cần thiết
    ReportQueryDto,
    TopNRevenueDto,
    RevenueBreakdownResponse,
} from "@/services";
import { Line, Pie } from "@ant-design/charts"; // 🔥 [MỚI] Import Pie
import {
    Card,
    Col,
    Row,
    Spin,
    Radio,
    DatePicker,
    Typography,
    Empty,
    Space,
    Alert,
    theme,
    Select,
} from "antd";
import { useState, useMemo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

// 🔥 [MỚI] Thêm Text và RangePicker
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

// Component loading/error/empty state
const ChartLoader = ({
    isLoading,
    error,
    data,
    children,
}: {
    isLoading: boolean;
    error: string | null;
    data: any[] | undefined | null; // Cho phép data là null
    children: React.ReactNode;
}) => {
    if (isLoading)
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 350,
                }}
            >
                <Spin tip="Loading data..." />
            </div>
        );
    if (error)
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 350,
                }}
            >
                <Alert message="Unable to load data" description={error} type="error" showIcon />
            </div>
        );
    if (!data || data.length === 0)
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 350,
                }}
            >
                <Empty description="No data to display" />
            </div>
        );
    return <>{children}</>;
};

// Chart 1: Revenue for the last N days (Giữ nguyên)
const RevenueLastDaysChart = () => {
    const { token } = theme.useToken();
    const [days, setDays] = useState<number>(7);
    const [data, setData] = useState<RevenueByDayData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getRevenueLastNDays(days);
                setData(result);
            } catch (err: any) {
                console.error("Failed to fetch revenue:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [days]);

    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

    const config = {
        data: data || [],
        xField: "date",
        yField: "revenue",
        height: 350,
        style: { lineWidth: 1 },
        point: { shapeField: "circle", sizeField: 2 },
        axis: {
            x: {
                title: `Revenue Over the Last ${days} Days`,
                line: { style: { lineWidth: 1, stroke: "#ddd" } },
            },
            y: {
                title: `Total Revenue: ${currencyFormatter.format(totalRevenue)}`,
                labelFormatter: (v: number) => currencyFormatter.format(v),
                line: { style: { lineWidth: 1, stroke: "#ddd" } },
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
        tooltip: {
            items: [
                {
                    channel: "y",
                    name: "Revenue",
                    valueFormatter: (v: number) => currencyFormatter.format(v),
                },
            ],
        },
    };

    return (
        <Card
            title="Recent Revenue Trends"
            extra={
                <Radio.Group
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    buttonStyle="solid"
                >
                    <Radio.Button value={7}>Last 7 days</Radio.Button>
                    <Radio.Button value={14}>Last 14 days</Radio.Button>
                    <Radio.Button value={30}>Last 30 days</Radio.Button>
                </Radio.Group>
            }
        >
            <ChartLoader isLoading={isLoading} error={error} data={data}>
                <Line {...config} />
            </ChartLoader>
        </Card>
    );
};

// Chart 2: Revenue by Month (Giữ nguyên)
const RevenueByMonthChart = () => {
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
    const params = useMemo(
        () => ({
            month: selectedMonth.month() + 1,
            year: selectedMonth.year(),
        }),
        [selectedMonth]
    );
    const [data, setData] = useState<RevenueByDayData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getRevenueByMonth(params);
                const today = dayjs();
                const mapped = result.map((r) => {
                    const date = dayjs(r.date, "DD-MM-YYYY");
                    const isFuture = date.isAfter(today, "day");
                    return {
                        date: date.format("DD-MM-YYYY"),
                        revenue: isFuture ? null : r.revenue,
                    };
                });
                setData(mapped);
            } catch (err: any) {
                console.error("Failed to fetch revenue by month:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [params]);

    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

    const config = {
        data: data || [],
        xField: "date",
        yField: "revenue",
        height: 350,
        style: { lineWidth: 1 },
        point: { shapeField: "circle", sizeField: 2 },
        axis: {
            x: {
                title: `Revenue Performance - ${selectedMonth.format("MM YYYY")}`,
                line: { style: { lineWidth: 1, stroke: "#ddd" } },
            },
            y: {
                title: `Total Revenue: ${currencyFormatter.format(totalRevenue)}`,
                labelFormatter: (v: number) => currencyFormatter.format(v),
                line: { style: { lineWidth: 1, stroke: "#ddd" } },
                grid: {
                    line: {
                        style: {
                            stroke: "#eee",
                            lineWidth: 1,
                            lineDash: [4, 5],
                        },
                    },
                },
            },
        },
        tooltip: {
            items: [
                {
                    channel: "y",
                    name: "Revenue",
                    valueFormatter: (v: number) => currencyFormatter.format(v),
                },
            ],
        },
    };

    return (
        <Card
            title="Monthly Revenue Overview"
            extra={
                <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                    allowClear={false}
                    format="MM-YYYY"
                />
            }
        >
            <ChartLoader isLoading={isLoading} error={error} data={data}>
                <Line {...config} />
            </ChartLoader>
        </Card>
    );
};

// Chart 3: Revenue by Year (Giữ nguyên)
const RevenueByYearChart = () => {
    const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());
    const yearParam = useMemo(() => selectedYear.year(), [selectedYear]);
    const [data, setData] = useState<RevenueByMonthData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getRevenueByYear(yearParam);
                const today = dayjs();
                const mapped = result.map((r) => {
                    const date = dayjs(r.month, "MM-YYYY");
                    const isFuture = date.isAfter(today, "day");
                    return {
                        month: date.format("MM-YYYY"),
                        revenue: isFuture ? null : r.revenue,
                    };
                });
                setData(mapped);
            } catch (err: any) {
                console.error("Failed to fetch revenue by year:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [yearParam]);

    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

    const config = {
        data,
        xField: "month",
        yField: "revenue",
        height: 350,
        style: { lineWidth: 1 },
        point: { shapeField: "circle", sizeField: 2 },
        axis: {
            x: {
                title: `Revenue by Month in ${yearParam}`,
                line: { style: { stroke: "#ddd", lineWidth: 1 } },
            },
            y: {
                title: `Total Revenue: ${currencyFormatter.format(totalRevenue)}`,
                labelFormatter: (v: number) => currencyFormatter.format(v),
                line: { style: { stroke: "#ddd", lineWidth: 1 } },
                grid: {
                    line: {
                        style: {
                            stroke: "#ddd",
                            lineWidth: 1,
                            lineDash: [4, 5],
                        },
                    },
                },
            },
        },
        tooltip: {
            items: [
                {
                    channel: "y",
                    name: "Revenue",
                    valueFormatter: (v: number) => currencyFormatter.format(v),
                },
            ],
        },
    };

    return (
        <Card
            title="Yearly Revenue Summary"
            extra={
                <DatePicker
                    picker="year"
                    value={selectedYear}
                    onChange={(date) => setSelectedYear(date || dayjs())}
                    allowClear={false}
                    format="YYYY"
                />
            }
        >
            <ChartLoader isLoading={isLoading} error={error} data={data}>
                <Line {...config} />
            </ChartLoader>
        </Card>
    );
};

const RevenueByProductChart = () => {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf("month"),
        dayjs().endOf("day"),
    ]);
    const [limit, setLimit] = useState(5);
    const [data, setData] = useState<RevenueBreakdownResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = theme.useToken();

    const params = useMemo(
        () => ({
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
            limit,
        }),
        [dateRange, limit]
    );

    useEffect(() => {
        if (!params.startDate || !params.endDate) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await reportService.getRevenueByProduct(params);

                const topNRevenueSum = result.data.reduce(
                    (sum, item) => sum + item.revenue,
                    0,
                );

                const othersRevenue = result.totalRevenue - topNRevenueSum;
                const othersPercentage =
                    result.totalRevenue > 0
                        ? (othersRevenue * 100) / result.totalRevenue
                        : 0;

                const finalData = [...result.data];
                if (othersRevenue > 0.01) {
                    finalData.push({
                        name: "Others",
                        revenue: othersRevenue,
                        percentage: othersPercentage,
                    });
                }

                setData({
                    totalRevenue: result.totalRevenue,
                    data: finalData,
                });
            } catch (err: any) {
                console.error("Failed to fetch revenue by product:", err);
                setError(err.message || "Unable to fetch data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [params]);

    // Format readable date range
    const formattedRange =
        params.startDate && params.endDate
            ? `${dayjs(params.startDate).format("DD/MM/YYYY")} - ${dayjs(params.endDate).format("DD/MM/YYYY")}`
            : "";

    const chartTitle = formattedRange
        ? `Top ${limit} Products by Revenue (${formattedRange})`
        : `Top ${limit} Products by Revenue`;

    const config = {
        data: data?.data || [],
        angleField: "revenue",
        colorField: "name",
        radius: 0.8,
        innerRadius: 0.6,
        height: 350,
        label: {
            position: "spider",
            text: (d: any) =>
                d?.percentage != null
                    ? `${d.percentage.toFixed(1)}%`
                    : d?.name || "",
        },
        tooltip: {
            items: [
                { channel: "color", name: "Product" },
                {
                    channel: "y",
                    name: "Revenue",
                    valueFormatter: (v: number) => currencyFormatter.format(v),
                },
            ],
        },
        interactions: [{ type: "element-active" }],
        statistic: {
            title: { text: "Total Revenue", style: { fontSize: 14 } },
            content: {
                text: data ? currencyFormatter.format(data.totalRevenue) : "...",
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
                    text: chartTitle,
                    x: "50%",
                    y: "100%",
                    textAlign: "center",
                    fontSize: 14,
                    fill: "#8c8c8c",
                },
            },
        ],
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    return (
        <Card
            title="Top Products by Revenue"
            extra={
                <Space>
                    <Select
                        value={limit}
                        onChange={(value: any) => setLimit(value)}
                        options={[
                            { value: 5, label: "Top 5" },
                            { value: 10, label: "Top 10" },
                            { value: 15, label: "Top 15" },
                        ]}
                        size={"small"}
                        style={{ width: 100 }}
                    />
                    <RangePicker
                        format={"DD-MM-YYYY"}
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        allowClear={false}
                    />
                </Space>
            }
            bodyStyle={{ paddingBottom: 16 }}
        >
            <ChartLoader isLoading={isLoading} error={error} data={data?.data}>
                <Pie {...config} />
            </ChartLoader>
        </Card>
    );
};

const RevenueByCategoryChart = () => {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf("month"),
        dayjs().endOf("day"),
    ]);
    const [data, setData] = useState<RevenueBreakdownResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo(
        () => ({
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
        }),
        [dateRange]
    );

    useEffect(() => {
        async function fetchData() {
            if (!params.startDate || !params.endDate) return;
            setIsLoading(true);
            try {
                const result = await reportService.getRevenueByCategory(params);

                const topNRevenueSum = result.data.reduce(
                    (sum, item) => sum + item.revenue,
                    0,
                );

                const othersRevenue = result.totalRevenue - topNRevenueSum;
                const othersPercentage =
                    result.totalRevenue > 0
                        ? (othersRevenue * 100) / result.totalRevenue
                        : 0;

                const finalData = [...result.data];
                // if (othersRevenue > 0.01) {
                //     finalData.push({
                //         name: "Others",
                //         revenue: othersRevenue,
                //         percentage: othersPercentage,
                //     });
                // }

                setData({
                    totalRevenue: result.totalRevenue,
                    data: finalData,
                });
            } catch (err: any) {
                setError(err.message || "Error fetching category revenue");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [params]);

    const formattedRange =
        params.startDate && params.endDate
            ? `${dayjs(params.startDate).format("DD/MM/YYYY")} - ${dayjs(params.endDate).format("DD/MM/YYYY")}`
            : "";

    const chartTitle = `Revenue by Category (${formattedRange})`

    const config = {
        data: data?.data || [],
        angleField: "revenue",
        colorField: "name",
        radius: 0.8,
        innerRadius: 0.6,
        height: 350,
        label: {
            text: (d: any) =>
                d?.percentage != null
                    ? `${d.percentage.toFixed(1)}%`
                    : d?.name || "",
            position: "spider",
            style: { fontWeight: 500 },
        },
        legend: {
            color: {
                title: false,
                position: "right",
                rowPadding: 5,
            },
        },
        tooltip: {
            items: [
                {
                    channel: "color",
                    name: "Category"
                },
                {
                    channel: "y",
                    name: "Revenue",
                    valueFormatter: (v: number) => currencyFormatter.format(v),
                },
            ]
        },
        annotations: [
            {
                type: "text",
                style: {
                    text: chartTitle,
                    x: "50%",
                    y: "100%",
                    textAlign: "center",
                    fontSize: 14,
                    fill: "#8c8c8c",
                },
            },
        ],


        statistic: {
            title: { text: "Total Revenue" },
            content: {
                text: data ? currencyFormatter.format(data.totalRevenue) : "...",
            },
        },
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    return (
        <Card
            title="Revenue by Category"
            extra={
                <RangePicker
                    format={"DD-MM-YYYY"}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    allowClear={false}
                />
            }
        >
            <ChartLoader isLoading={isLoading} error={error} data={data?.data}>
                <Pie {...config} />
            </ChartLoader>
        </Card>
    );
};


// Main Component
export function RevenueCharts() {
    return (
        <div style={{ marginTop: 24 }}>
            <Title level={4}>Revenue Overview</Title>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Các biểu đồ đường đã có */}
                <RevenueByMonthChart />
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <RevenueLastDaysChart />
                    </Col>
                    <Col xs={24} lg={12}>
                        <RevenueByYearChart />
                    </Col>
                </Row>


                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <RevenueByProductChart />
                    </Col>
                    <Col xs={24} lg={12}>
                        <RevenueByCategoryChart />
                    </Col>
                </Row>
            </Space>
        </div>
    );
}