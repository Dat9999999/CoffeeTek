'use client';
import { useEffect, useState } from "react";
import {
    Modal, Form, Input, Button, message, Card, theme, Flex,
} from "antd";
import {
    PlusOutlined, DeleteOutlined, HolderOutlined,
} from "@ant-design/icons";
import {
    DragDropContext, Droppable, Draggable,
} from "react-beautiful-dnd";
import { optionGroupService } from "@/services/optionGroupService";
import { optionValueService } from "@/services/optionValueService";
import type { OptionGroup, EditableOptionValue } from "@/interfaces";

interface EditOptionGroupModalProps {
    open: boolean;
    onClose: () => void;
    record?: OptionGroup | null;
    onSuccess: () => void;
}

// 🟩 Helper: cập nhật sort_index chuẩn
const updateSortIndexes = (values: EditableOptionValue[]): EditableOptionValue[] => {
    const active = values.filter(v => !v.isDeleted);

    const reindexed = active.map((v, index) => ({
        ...v,
        sort_index: index + 1,
        isUpdated: v.isNew ? false : true,
    }));

    const deleted = values.filter(v => v.isDeleted);
    return [...reindexed, ...deleted] as EditableOptionValue[];
};

export function EditOptionGroupModal({ open, onClose, record, onSuccess }: EditOptionGroupModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [optionValues, setOptionValues] = useState<EditableOptionValue[]>([]);
    const { token } = theme.useToken();

    // 🟢 Load option values khi mở modal
    useEffect(() => {
        if (record?.id && open) {
            (async () => {
                try {
                    const res = await optionValueService.getAll({
                        orderBy: "sort_index",
                        orderDirection: "asc",
                        size: 9999,
                    });
                    const filtered = res.data.filter((ov: any) => ov.option_group_id === record.id);
                    setOptionValues(filtered);
                    form.setFieldsValue(record);
                } catch {
                    message.error("Failed to load option values");
                }
            })();
        } else {
            setOptionValues([]);
            form.resetFields();
        }
    }, [record, open]);

    // 🟢 Thêm option value mới
    const handleAddOptionValue = () => {
        setOptionValues(prev => {
            const newItem: EditableOptionValue = {
                id: Math.random(),
                name: "",
                sort_index: prev.filter(p => !p.isDeleted).length + 1,
                option_group_id: record!.id,
                isNew: true,
            };
            return [...prev, newItem];
        });
    };

    // 🟢 Xóa option value (đánh dấu isDeleted)
    const handleRemoveOptionValue = (id: number) => {
        setOptionValues(prev => {
            const updated = prev.map(ov =>
                ov.id === id ? { ...ov, isDeleted: true } : ov
            );
            return updateSortIndexes(updated);
        });
    };

    // 🟢 Đổi tên option value
    const handleChangeOptionValue = (id: number, name: string) => {
        setOptionValues(prev =>
            prev.map(ov =>
                ov.id === id ? { ...ov, name, isUpdated: ov.isNew ? false : true } : ov
            )
        );
    };

    // 🟢 Kéo thả reorder
    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const activeItems = optionValues.filter(o => !o.isDeleted);
        const [moved] = activeItems.splice(result.source.index, 1);
        activeItems.splice(result.destination.index, 0, moved);

        const deletedItems = optionValues.filter(o => o.isDeleted);
        setOptionValues(updateSortIndexes([...activeItems, ...deletedItems]));
    };

    // 🟢 Submit update toàn bộ
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;

            const activeValues = optionValues.filter(o => !o.isDeleted);
            if (activeValues.some(ov => !ov.name.trim())) {
                message.error("All option values must have a name!");
                return;
            }

            setLoading(true);

            // 1️⃣ Update group name
            await optionGroupService.update(record.id, { name: values.name });

            // 2️⃣ Chuẩn hóa sort_index
            const normalized = updateSortIndexes(optionValues);

            // 3️⃣ Gọi API tương ứng
            for (const ov of normalized) {
                if (ov.isDeleted && !ov.isNew) {
                    await optionValueService.delete(ov.id);
                } else if (ov.isNew && !ov.isDeleted) {
                    await optionValueService.create({
                        name: ov.name,
                        option_group_id: record.id,
                        sort_index: ov.sort_index,
                    });
                } else if (ov.isUpdated && !ov.isDeleted) {
                    await optionValueService.update(ov.id, {
                        name: ov.name,
                        option_group_id: record.id,
                        sort_index: ov.sort_index,
                    });
                }
            }

            message.success("Option group updated successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Name already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Option Group"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Update"
            confirmLoading={loading}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Group Name"
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
                                {optionValues
                                    .filter(ov => !ov.isDeleted)
                                    .sort((a, b) => a.sort_index - b.sort_index)
                                    .map((ov, index) => (
                                        <Draggable
                                            key={ov.id.toString()}
                                            draggableId={ov.id.toString()}
                                            index={index}
                                        >
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
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                cursor: "grab",
                                                                color: token.colorTextTertiary,
                                                                marginRight: token.marginXS,
                                                            }}
                                                        >
                                                            <HolderOutlined />
                                                        </div>

                                                        <Input
                                                            style={{ flex: 1 }}
                                                            placeholder={`Option value #${index + 1}`}
                                                            value={ov.name}
                                                            onChange={(e) =>
                                                                handleChangeOptionValue(ov.id, e.target.value)
                                                            }
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
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOptionValue}>
                        Add Option Value
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
