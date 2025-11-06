"use client";

import { Modal, Form, InputNumber, Typography, Space, theme } from "antd";
import { useEffect } from "react";
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from "@ant-design/icons";
import type { ExtendedRecord } from "./InventoryCheckingComponent";

interface EditStockModalProps {
    open: boolean;
    record: ExtendedRecord | null;
    onClose: () => void;
    onSave: (updated: ExtendedRecord) => void;
}

const { Text, Title } = Typography;

export function EditStockModal({ open, record, onClose, onSave }: EditStockModalProps) {
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                lastRemainQuantity: record.lastRemainQuantity,
                record: record.record,
                changes: record.changes,
            });
        }
    }, [open, record, form]);

    const handleValuesChange = (changed: any) => {
        if (!record) return;

        // Nếu thay đổi Stock Difference => cập nhật Current System Stock
        if ("changes" in changed) {
            form.setFieldsValue({
                record: record.lastRemainQuantity + changed.changes,
            });
        }
        // Nếu thay đổi Current System Stock => cập nhật Stock Difference
        else if ("record" in changed) {
            form.setFieldsValue({
                changes: changed.record - record.lastRemainQuantity,
            });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSave({
                ...record!,
                record: values.record,
                changes: values.changes,
            });
            onClose();
        } catch { }
    };

    const changesValue = Form.useWatch("changes", form);

    // Màu và icon cho Stock Difference
    const renderDifference = (value?: number) => {
        if (value === undefined) return null;
        let color = token.colorTextSecondary;
        let icon = null;
        if (value > 0) {
            color = token.colorSuccess;
            icon = <ArrowUpOutlined />;
        } else if (value < 0) {
            color = token.colorError;
            icon = <ArrowDownOutlined />;
        }
        return (
            <Space style={{ color, fontWeight: 500 }}>
                {icon} {value.toFixed(2)}
            </Space>
        );
    };

    return (
        <Modal
            open={open}
            title={
                <Title level={5} style={{ margin: 0 }}>
                    Edit Stock –{" "}
                    <Text strong style={{ color: token.colorPrimary }}>
                        {record?.materialName}
                    </Text>
                </Title>
            }
            okText="Save"
            onOk={handleOk}
            onCancel={onClose}
            destroyOnClose
            centered
            width={400}
            bodyStyle={{ paddingTop: 16 }}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                style={{ maxWidth: "100%" }}
            >
                <div
                    style={{
                        marginBottom: 12,
                        padding: 8,
                        background: token.colorFillTertiary,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    <Text type="secondary">Previous Stock:</Text>{" "}
                    <Text strong>{record?.lastRemainQuantity?.toFixed(2)}</Text>
                </div>

                <Form.Item label="Current Stock" name="record" required>
                    <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder="Enter current stock"
                    />
                </Form.Item>

                <Form.Item label="Stock Difference" name="changes" required>
                    <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder="Enter difference"
                    />
                </Form.Item>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: 12,
                        fontSize: 16,
                    }}
                >
                    {renderDifference(changesValue ?? record?.changes)}
                </div>
            </Form>
        </Modal>
    );
}
