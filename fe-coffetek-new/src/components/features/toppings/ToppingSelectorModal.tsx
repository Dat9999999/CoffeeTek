'use client';
import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Space, Spin, message } from "antd";
import type { Topping } from "@/interfaces";
import { toppingService } from "@/services/toppingService";

interface ToppingSelectorModalProps {
    open: boolean;
    selectedToppings: Topping[];
    onClose: () => void;
    onConfirm: (selected: Topping[]) => void;
}

export const ToppingSelectorModal: React.FC<ToppingSelectorModalProps> = ({
    open,
    selectedToppings,
    onClose,
    onConfirm,
}) => {
    const [loading, setLoading] = useState(false);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(
        selectedToppings.map(t => t.id)
    );

    useEffect(() => {
        if (open) loadToppings();
    }, [open]);

    const loadToppings = async () => {
        try {
            setLoading(true);
            const res = await toppingService.getAll({ page: 1, size: 100 });
            setToppings(res.data || []);
        } catch {
            message.error("Failed to load toppings");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        const selected = toppings.filter(t => selectedRowKeys.includes(t.id));
        onConfirm(selected);
    };

    const columns = [
        { title: "Name", dataIndex: "name" },
        {
            title: "Price",
            dataIndex: "price",
            render: (v: number) => `${v.toLocaleString()} ₫`
        },
    ];

    return (
        <Modal
            title="Select Toppings"
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okText="Select"
            width={600}
        >
            {loading ? (
                <Spin />
            ) : (
                <Table
                    rowKey="id"
                    dataSource={toppings}
                    columns={columns}
                    rowSelection={{
                        type: "checkbox",
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                    }}
                    pagination={false}
                    size="small"
                />
            )}
        </Modal>
    );
};
