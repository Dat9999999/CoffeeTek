'use client';

import { useEffect, useState } from 'react';
import {
    Modal,
    Checkbox,
    Button,
    Spin,
    Table,
    Flex,
    theme,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { optionGroupService } from '@/services/optionGroupService';
import { OptionGroup, OptionValue } from '@/interfaces';

interface OptionGroupSelectorProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (selectedGroups: OptionGroup[]) => void;
    selectedValueIds: number[];
}

export function OptionGroupSelector({
    open,
    onClose,
    onConfirm,
    selectedValueIds,
}: OptionGroupSelectorProps) {
    const { token } = theme.useToken();

    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<OptionGroup[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            loadOptionGroups();
            setSelectedIds(selectedValueIds);
        }
    }, [open]);

    const loadOptionGroups = async () => {
        try {
            setLoading(true);
            const res = await optionGroupService.getAll({ page: 1, size: 100 });
            const data = res.data || [];

            // ✅ Sort groups: those with values first, then empty ones
            data.sort((a: OptionGroup, b: OptionGroup) => {
                const aHas = a.values && a.values.length > 0;
                const bHas = b.values && b.values.length > 0;
                if (aHas === bHas) return 0;
                return aHas ? -1 : 1; // groups with values first
            });

            setGroups(data);
        } catch (err) {
            console.error('Failed to load option groups:', err);
            message.error('Failed to load option groups list');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleValue = (id: number, checked: boolean) => {
        setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((v) => v !== id)
        );
    };

    const handleToggleGroup = (group: OptionGroup, checked: boolean) => {
        const valueIds = group.values?.map((v) => v.id) || [];
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, ...valueIds]));
            } else {
                return prev.filter((id) => !valueIds.includes(id));
            }
        });
    };

    const handleConfirm = () => {
        const selectedGroups: OptionGroup[] = groups.map((g) => ({
            ...g,
            values: g.values?.filter((v) => selectedIds.includes(v.id)) || [],
        })).filter((g) => g.values && g.values.length > 0);

        onConfirm(selectedGroups);
        onClose();
    };

    const columns: ColumnsType<OptionGroup> = [
        {
            title: 'Option Group',
            dataIndex: 'name',
            key: 'name',
            render: (_, group) => {
                const hasValues = group.values && group.values.length > 0;
                const allChecked =
                    hasValues && group.values!.every((v) => selectedIds.includes(v.id));
                const someChecked =
                    hasValues && group.values!.some((v) => selectedIds.includes(v.id));

                return (
                    <Checkbox
                        indeterminate={!allChecked && someChecked}
                        checked={allChecked}
                        disabled={!hasValues}
                        onChange={(e) => handleToggleGroup(group, e.target.checked)}
                    >
                        <span
                            style={{
                                fontWeight: token.fontWeightStrong,
                                color: !hasValues
                                    ? token.colorTextDisabled
                                    : token.colorTextBase,
                            }}
                        >
                            {group.name}
                        </span>
                    </Checkbox>
                );
            },
        },
        {
            title: 'Option Values',
            dataIndex: 'values',
            key: 'values',
            render: (_, group) => {
                const hasValues = group.values && group.values.length > 0;

                if (!hasValues)
                    return (
                        <span style={{ color: token.colorTextDisabled }}>
                            No values
                        </span>
                    );

                return (
                    <Flex wrap="wrap" gap={12}>
                        {group.values!.map((v) => (
                            <Checkbox
                                key={v.id}
                                checked={selectedIds.includes(v.id)}
                                onChange={(e) => handleToggleValue(v.id, e.target.checked)}
                            >
                                {v.name}
                            </Checkbox>
                        ))}
                    </Flex>
                );
            },
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Select Option Groups"
            style={{ top: 10 }}
            width={800}
            footer={
                <Flex justify="flex-end" gap={8}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Flex>
            }
        >
            {loading ? (
                <Flex justify="center" align="center" style={{ padding: 40 }}>
                    <Spin />
                </Flex>
            ) : (
                <Table
                    dataSource={groups}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    bordered
                    style={{
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        borderRadius: token.borderRadiusLG,
                    }}
                />
            )}
        </Modal>
    );
}
