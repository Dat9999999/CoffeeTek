"use client";

import React from "react";
import { Select } from "antd";
import { OrderStatus } from "@/interfaces";

const { Option } = Select;

interface OrderStatusFilterProps {
    value?: string;
    onChange: (value: string) => void;
}

const STATUS_OPTIONS = [
    { label: "Pending", value: OrderStatus.PENDING },
    { label: "Paid", value: OrderStatus.PAID },
    { label: "Completed", value: OrderStatus.COMPLETED },
    { label: "Canceled", value: OrderStatus.CANCELED },
];

export const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({
    value,
    onChange,
}) => {
    return (
        <Select
            mode="multiple"
            value={value ? value.split(',').filter(v => v.trim() !== '') : []}
            onChange={(values: string[]) => onChange(values.join(','))}
            style={{ minWidth: 150 }}
            placeholder="Filter by Status"
            allowClear
        >
            {STATUS_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                    {option.label}
                </Option>
            ))}
        </Select>
    );
};
