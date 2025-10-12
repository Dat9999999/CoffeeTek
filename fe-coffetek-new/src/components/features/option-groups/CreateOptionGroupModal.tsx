'use client';
import { useState } from "react";
import {
    Modal, Form, Input, Button, Space, message, Card, theme,
    Flex,
} from "antd";
import {
    PlusOutlined, DeleteOutlined, DragOutlined,
    HolderOutlined,
} from "@ant-design/icons";
import {
    DragDropContext, Droppable, Draggable,
} from "react-beautiful-dnd";
import { optionGroupService } from "@/services/optionGroupService";
import { optionValueService } from "@/services/optionValueService";

interface CreateOptionGroupModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateOptionGroupModal({ open, onClose, onSuccess }: CreateOptionGroupModalProps) {
    const [form] = Form.useForm();
    const [optionValues, setOptionValues] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // 🟢 Lấy token từ theme
    const { token } = theme.useToken();

    const handleAddOptionValue = () => {
        setOptionValues((prev) => [
            ...prev,
            { id: Math.random().toString(36).substring(2, 9), name: "" },
        ]);
    };

    const handleRemoveOptionValue = (id: string) => {
        setOptionValues((prev) => prev.filter((ov) => ov.id !== id));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(optionValues);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setOptionValues(items);
    };

    const handleChangeOptionValue = (id: string, value: string) => {
        setOptionValues((prev) =>
            prev.map((ov) => (ov.id === id ? { ...ov, name: value } : ov))
        );
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (optionValues.some((ov) => !ov.name.trim())) {
                message.error("All option values must have a name!");
                return;
            }

            setLoading(true);

            const group = await optionGroupService.create({ name: values.name });

            for (const ov of optionValues) {
                await optionValueService.create({
                    name: ov.name,
                    option_group_id: group.id,
                });
            }

            message.success("Option group created successfully!");
            form.resetFields();
            setOptionValues([]);
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Option group name already exists!");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Option Group"
            open={open}
            onCancel={() => {
                form.resetFields();
                setOptionValues([]);
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setOptionValues([]);
                }
            }}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Option Group Name"
                    rules={[{ required: true, message: "Please enter the option group name!" }]}
                >
                    <Input placeholder="Enter option group name" />
                </Form.Item>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: token.marginSM,
                    }}
                >
                    <span style={{ fontWeight: 500, color: token.colorText }}>
                        Option Values
                    </span>

                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="optionValues">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {optionValues.map((ov, index) => (
                                    <Draggable key={ov.id} draggableId={ov.id} index={index}>
                                        {(provided, snapshot) => (
                                            <Card
                                                size="small"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    background: snapshot.isDragging
                                                        ? token.colorFillAlter
                                                        : token.colorBgContainer,
                                                    border: `1px solid ${token.colorBorderSecondary}`,
                                                    borderRadius: token.borderRadiusLG,
                                                    marginBottom: token.marginXS,
                                                }}
                                            >
                                                <Flex align="center" gap="small" style={{ width: "100%" }}>
                                                    <div {...provided.dragHandleProps}
                                                        style={{
                                                            cursor: "grab",
                                                            color: token.colorTextTertiary,
                                                            marginRight: token.marginXS
                                                        }}>
                                                        <HolderOutlined />
                                                    </div>

                                                    <Input
                                                        style={{ flex: 1 }}
                                                        placeholder={`Option value #${index + 1}`}
                                                        value={ov.name}
                                                        onChange={(e) => handleChangeOptionValue(ov.id, e.target.value)}
                                                    />

                                                    <Button
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        danger
                                                        onClick={() => handleRemoveOptionValue(ov.id)}
                                                    />
                                                </Flex>

                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={handleAddOptionValue}
                    >
                        Add Option Value
                    </Button>
                </div>

            </Form>
        </Modal>
    );
}
