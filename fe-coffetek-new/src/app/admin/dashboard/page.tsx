// src/app/dashboard/page.tsx

"use client";
import { PageHeader } from "@/components/layouts";
import { DashboardOutlined } from "@ant-design/icons";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { RevenueCharts } from "./RevenueCharts";
import { ProductCharts } from "./ProductCharts";
import { ProfitChart } from "./ProfitChart";

// 1. Import component mới

export default function DashboardPage() {
    return (
        <>
            <PageHeader icon={<DashboardOutlined />} title="Dashboard" />

            {/* 2. Thêm section đầu tiên vào đây */}
            <DashboardStatsGrid />

            {/* (Các section biểu đồ của bạn sẽ được thêm vào bên dưới) */}
            <RevenueCharts />

            <ProductCharts />

            {/* 2️⃣ Biểu đồ doanh thu - chi phí - lợi nhuận */}
            <ProfitChart />
        </>
    );
}