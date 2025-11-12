'use client';
import { useEffect, useState } from "react";
import {
    Modal,
    Descriptions,
    Table,
    Spin,
    message,
    theme,
    Typography,
    Row,
    Col,
    Card,
} from "antd";
import type { OptionGroup, OptionValue } from "@/interfaces";
import { optionGroupService } from "@/services/optionGroupService";

const { Title } = Typography;

interface OptionGroupDetailModalProps {
    open: boolean;
    onClose: () => void;
    id?: number | null;
}

export function OptionGroupDetailModal({ open, onClose, id }: OptionGroupDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState<OptionGroup | null>(null);

    const { token } = theme.useToken();

    useEffect(() => {
        if (open && id) fetchData();
    }, [open, id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await optionGroupService.getById(id!);
            setRecord(res);
        } catch (err) {
            console.error(err);
            message.error("Failed to load option group details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Option Group Details</Title>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
            bodyStyle={{
                background: token.colorBgContainer,
                padding: token.paddingLG,
                borderRadius: token.borderRadiusLG,
            }}
            style={{ maxWidth: "95vw" }}
        >
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: token.paddingXL,
                    }}
                >
                    <Spin size="large" />
                </div>
            ) : record ? (
                <Row gutter={[token.marginLG, token.marginLG]}>
                    {/* LEFT COLUMN */}
                    <Col xs={24} >
                        <Card
                            size="small"
                            title="Basic Information"
                            bordered
                            style={{
                                borderRadius: token.borderRadiusLG,
                                boxShadow: token.boxShadowTertiary,
                                background: token.colorBgContainer,
                            }}
                            headStyle={{
                                background: token.colorFillAlter,
                                fontWeight: 600,
                                color: token.colorTextHeading,
                            }}
                        >
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                labelStyle={{
                                    background: token.colorFillAlter,
                                    fontWeight: 500,
                                    color: token.colorTextSecondary,
                                }}
                                contentStyle={{
                                    color: token.colorText,
                                }}
                            >
                                <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                                <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* RIGHT COLUMN */}
                    <Col xs={24} >
                        <Card
                            size="small"
                            title="Option Values"
                            bordered
                            style={{
                                borderRadius: token.borderRadiusLG,
                                boxShadow: token.boxShadowTertiary,
                                background: token.colorBgContainer,
                            }}
                            headStyle={{
                                background: token.colorFillAlter,
                                fontWeight: 600,
                                color: token.colorTextHeading,
                            }}
                        >
                            <Table<OptionValue>
                                dataSource={record.values}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                bordered
                                style={{
                                    borderRadius: token.borderRadius,
                                    background: token.colorBgContainer,
                                }}
                                columns={[
                                    {
                                        title: "ID",
                                        dataIndex: "id",
                                        width: 70,
                                    },
                                    {
                                        title: "Value Name",
                                        dataIndex: "name",
                                    },
                                    {
                                        title: "Sort Index",
                                        dataIndex: "sort_index",
                                        width: 100,
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <p style={{ color: token.colorTextSecondary }}>No data available</p>
            )}
        </Modal>
    );
}
