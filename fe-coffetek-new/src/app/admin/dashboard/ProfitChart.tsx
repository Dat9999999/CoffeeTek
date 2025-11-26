"use client";

import React, { useEffect, useState } from "react";
import { Card, Select, Spin, Typography, message } from "antd";
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    Bar,
    Line,
} from "recharts";
import dayjs from "dayjs";
import { reportService } from "@/services/reportService"; // ✅ Use real service
const { Title } = Typography;

interface MonthlyProfitData {
    month: string; // "01" - "12"
    revenue: number | null;
    cost: number | null;
    profit: number | null;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; // 1-12

// Custom Tooltip (English)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border rounded shadow-md">
                <p className="font-bold">{`Month: ${label}`}</p>
                {payload.map((entry: any) =>
                    entry.value !== null ? (
                        <p key={entry.name} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value.toLocaleString("en-US")}`}
                        </p>
                    ) : null
                )}
            </div>
        );
    }
    return null;
};

// Y-Axis Formatter
const formatYAxis = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

export const ProfitChart: React.FC = () => {
    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<MonthlyProfitData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (selectedYear: number) => {
        try {
            setLoading(true);

            // 🔁 Create 12 API calls (1 per month)
            const promises = Array.from({ length: 12 }, async (_, i) => {
                const monthIndex = i + 1;

                // If this is a future month in the same year → no render
                if (
                    selectedYear > currentYear ||
                    (selectedYear === currentYear && monthIndex > currentMonth)
                ) {
                    return {
                        month: String(monthIndex).padStart(2, "0"),
                        revenue: null,
                        cost: null,
                        profit: null,
                    } as MonthlyProfitData;
                }

                const start = dayjs(`${selectedYear}-${String(monthIndex).padStart(2, "0")}-01`);
                const end = start.endOf("month");

                const startDate = start.toDate().toISOString();
                const endDate = end.toDate().toISOString();

                return reportService
                    .getProfitReport({ startDate, endDate })
                    .then((res: any) => {
                        const revenue = Number(
                            res?.total_revenue ?? res?.totalRevenue ?? res?.revenue ?? 0
                        );
                        const cost = Number(
                            res?.cogs ?? res?.cost ?? res?.cogs_total ?? 0
                        );
                        const profit = Number(
                            res?.profit ?? res?.netProfit ?? (revenue - cost)
                        );

                        return {
                            month: String(monthIndex).padStart(2, "0"),
                            revenue,
                            cost,
                            profit,
                        } as MonthlyProfitData;
                    })
                    .catch((err) => {
                        console.error(
                            `❌ Error fetching profit for ${selectedYear}-${String(
                                monthIndex
                            ).padStart(2, "0")}`,
                            err
                        );
                        return {
                            month: String(monthIndex).padStart(2, "0"),
                            revenue: 0,
                            cost: 0,
                            profit: 0,
                        } as MonthlyProfitData;
                    });
            });

            const monthlyData = await Promise.all(promises);
            monthlyData.sort((a, b) => Number(a.month) - Number(b.month));
            setData(monthlyData);
        } catch (err) {
            console.error(err);
            message.error("Failed to load monthly profit data!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(year);

    }, [year]);

    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    if (loading) {
        return <div style={{ padding: 48, textAlign: "center" }}>
            <Spin size="default" />
        </div>
    }

    return (
        <>
            <Title level={4}>Revenue Overview</Title>

            <Card
                title="Profit calculation based on revenue and material cost"
                extra={
                    <Select
                        value={year}
                        style={{ width: 140 }}
                        onChange={(v) => setYear(v)}
                        options={years.map((y) => ({ label: y.toString(), value: y }))}
                    />
                }
                bordered={false}
                style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    marginBottom: 24,
                }}
            >
                {loading ? (
                    <div style={{ padding: 48, textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    label={{ value: "Month", position: "insideBottom", offset: -10 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={formatYAxis}
                                    label={{
                                        value: "Revenue / Cost (VND)",
                                        angle: -90,
                                        position: "insideLeft",
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatYAxis}
                                    label={{
                                        value: "Profit (VND)",
                                        angle: 90,
                                        position: "insideRight",
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: 20 }} />

                                {/* Revenue */}
                                <Bar
                                    yAxisId="left"
                                    dataKey="revenue"
                                    name="Revenue"
                                    fill="#5B8FF9"
                                />
                                {/* Cost */}
                                <Bar
                                    yAxisId="left"
                                    dataKey="cost"
                                    name="Cost"
                                    fill="#E57373"
                                />
                                {/* Profit */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="profit"
                                    name="Profit"
                                    stroke="#5AD8A6"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </>
    );
};

export default ProfitChart;
