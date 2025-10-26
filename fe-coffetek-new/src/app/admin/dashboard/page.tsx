"use client";
import { PageHeader } from "@/components/layouts";
import { DashboardFilled, DashboardOutlined, DashOutlined } from "@ant-design/icons";

export default function DashboardPage() {
    return (
        <>
            <PageHeader icon={<DashboardOutlined />} title="Dashboard" />
        </>
    );
}
