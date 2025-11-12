// src/components/dashboard/DashboardStatsGrid.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Skeleton, Alert, theme } from 'antd';
import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    UsergroupAddOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    WalletOutlined,
    GiftOutlined,
    ShoppingOutlined,
    SmileOutlined,
    RedoOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { reportService, DashboardStats } from '@/services';
import { formatPrice } from '@/utils';

export function DashboardStatsGrid() {
    const { token } = theme.useToken();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [customerStats, setCustomerStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [dashboardData, customerData] = await Promise.all([
                    reportService.getDashboardStats(),
                    reportService.getCustomerSegments({
                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                        endDate: new Date().toISOString(),
                    }),
                ]);
                setStats(dashboardData);
                setCustomerStats(customerData);
            } catch (err: any) {
                console.error("Failed to fetch dashboard stats:", err);
                setError(err.message || 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Row gutter={[16, 16]} style={{ paddingBottom: '24px' }}>
                {[...Array(10)].map((_, i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                        <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
                    </Col>
                ))}
            </Row>
        );
    }

    if (error || !stats || !customerStats) {
        return <Alert message="Error loading dashboard data" description={error} type="error" showIcon />;
    }

    const revenueChange = stats.revenueYesterday === 0
        ? (stats.revenueToday > 0 ? 100 : 0)
        : ((stats.revenueToday - stats.revenueYesterday) / stats.revenueYesterday) * 100;

    const revenueChangeColor = revenueChange >= 0 ? token.colorSuccess : token.colorError;
    const isRevenueUp = revenueChange >= 0;

    return (
        <div style={{ paddingBottom: '24px' }}>
            <Row gutter={[16, 16]}>
                {/* === ROW 1 === */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Revenue"
                            value={formatPrice(stats.revenueToday, { includeSymbol: true })}
                            valueStyle={{ color: token.colorSuccess }}
                            prefix={<DollarCircleOutlined />}
                        />
                        <Typography.Text type="secondary" style={{ fontSize: '0.9em' }}>
                            <span style={{ color: revenueChangeColor, marginRight: 4 }}>
                                {isRevenueUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {revenueChange.toFixed(1)}%
                            </span>
                            vs. yesterday ({formatPrice(stats.revenueYesterday, { includeSymbol: true })})
                        </Typography.Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders Today"
                            value={stats.totalOrdersToday}
                            prefix={<ShoppingCartOutlined />}
                            suffix="orders"
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Cancelled Today"
                            value={stats.cancelledOrdersToday}
                            valueStyle={{ color: stats.cancelledOrdersToday > 0 ? token.colorError : token.colorText }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Out of Stock Materials"
                            value={stats.outOfStockMaterials}
                            valueStyle={{ color: stats.outOfStockMaterials > 0 ? token.colorWarningText : token.colorText }}
                            prefix={<ExclamationCircleOutlined />}
                            suffix="items"
                        />
                    </Card>
                </Col>

                {/* === ROW 2 === */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Total Members" value={stats.totalMembers} prefix={<UsergroupAddOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Products" value={stats.totalActiveProducts} prefix={<ShoppingOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Products (Toppings)" value={stats.totalActiveToppings} prefix={<PlusOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Top Payment Method Today"
                            value={stats.topPaymentMethodToday}
                            valueStyle={{ fontSize: '1.25rem', color: token.colorPrimary }}
                            prefix={<WalletOutlined />}
                        />
                    </Card>
                </Col>

                {/* === ROW 3: Promotion & Customer Info === */}
                {/* Promotion Card */}
                <Col xs={24} md={18}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Active Promotion"
                            value={stats.activePromotionName}
                            valueStyle={{
                                color:
                                    stats.activePromotionName !== 'No Promotion'
                                        ? token.colorSuccessText
                                        : token.colorTextSecondary,
                            }}
                            prefix={<GiftOutlined />}
                        />
                    </Card>
                </Col>

                {/* Customer Overview */}
                <Col xs={24} md={6}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Customer Overview (This Month)"
                            valueRender={() => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div>
                                        <UserAddOutlined style={{ marginRight: 6, color: token.colorPrimary }} />
                                        New: {customerStats.newCustomers}
                                    </div>
                                    <div>
                                        <SmileOutlined style={{ marginRight: 6, color: token.colorSuccess }} />
                                        Returning Rate: {customerStats.returningCustomerRate}%
                                    </div>
                                </div>
                            )}
                        />
                    </Card>
                </Col>

            </Row>
        </div>
    );
}
