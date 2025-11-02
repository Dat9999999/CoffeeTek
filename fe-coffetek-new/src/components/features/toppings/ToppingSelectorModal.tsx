'use client';

import { useEffect, useState } from 'react';
import {
    Modal,
    Input,
    List,
    Image,
    Checkbox,
    Button,
    Spin,
    theme,
    Flex,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { toppingService } from '@/services/toppingService';
import { Topping } from '@/interfaces';
import { formatPrice } from '@/utils';

interface ToppingSelectModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (ids: number[]) => void;
    selectedToppingIds: number[];
}

export function ToppingSelectorModal({
    open,
    onClose,
    onConfirm,
    selectedToppingIds,
}: ToppingSelectModalProps) {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
    const { token } = theme.useToken();

    const [loading, setLoading] = useState(false);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            loadToppings();
            setSelectedIds(selectedToppingIds);
        }
    }, [open]);

    const loadToppings = async () => {
        try {
            setLoading(true);
            const res = await toppingService.getAll();
            setToppings(res.data || []);
        } catch (err) {
            console.error('Failed to load toppings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: number, checked: boolean) => {
        setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((i) => i !== id)
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedIds);
        onClose();
    };

    const filteredToppings = toppings.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal
            style={{ top: 20 }}
            open={open}
            onCancel={onClose}
            title="Select Topping"
            width={600}
            footer={
                <Flex justify="flex-end" gap={8}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                </Flex>
            }
        >
            <Input
                prefix={<SearchOutlined />}
                placeholder="Search topping..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    marginBottom: token.marginMD,
                    borderRadius: token.borderRadiusLG,
                    padding: token.paddingXS,
                }}
            />

            {loading ? (
                <Flex
                    justify="center"
                    align="center"
                    style={{ padding: token.paddingXL }}
                >
                    <Spin />
                </Flex>
            ) : (
                // ✅ Thêm vùng scroll tại đây
                <div
                    style={{
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        paddingRight: 8,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    <List
                        dataSource={filteredToppings}
                        rowKey="id"
                        itemLayout="horizontal"
                        renderItem={(item) => {
                            const selected = selectedIds.includes(item.id);
                            return (
                                <List.Item style={{ padding: 0 }}>
                                    <Flex
                                        align="center"
                                        gap={12}
                                        style={{
                                            width: '100%',
                                            cursor: 'pointer',
                                            padding: `${token.paddingXS + 2}px ${token.paddingSM}px`,
                                            borderRadius: token.borderRadiusLG,
                                            transition:
                                                'background 0.2s, box-shadow 0.2s',
                                            backgroundColor: selected
                                                ? token.colorPrimaryBgHover
                                                : token.colorBgContainer,
                                            boxShadow: selected
                                                ? token.boxShadowTertiary
                                                : 'none',
                                            border: selected
                                                ? `1px solid ${token.colorPrimaryBorder}`
                                                : `1px solid ${token.colorBorderSecondary}`,
                                            marginBottom: token.marginXXS,
                                        }}
                                        onClick={() =>
                                            handleToggle(item.id, !selected)
                                        }
                                    >
                                        <Image
                                            src={`${baseUrl}/${item.image_name}`}
                                            alt={item.name}
                                            width={50}
                                            height={50}
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius:
                                                    token.borderRadius,
                                                border: `1px solid ${token.colorBorderSecondary}`,
                                            }}
                                            preview={false}
                                        />

                                        <Flex vertical style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontWeight:
                                                        token.fontWeightStrong,
                                                    color: token.colorText,
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                            <div
                                                style={{
                                                    color: token.colorTextSecondary,
                                                    fontSize:
                                                        token.fontSizeSM,
                                                }}
                                            >
                                                {formatPrice(item.price, { includeSymbol: true })}

                                            </div>
                                        </Flex>

                                        <Checkbox
                                            checked={selected}
                                            onChange={(e) =>
                                                handleToggle(
                                                    item.id,
                                                    e.target.checked
                                                )
                                            }
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                    </Flex>
                                </List.Item>
                            );
                        }}
                    />
                </div>
            )}
        </Modal>
    );
}
