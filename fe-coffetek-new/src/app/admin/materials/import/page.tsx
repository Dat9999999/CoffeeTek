"use client";
import { MaterialSearchSelector } from "@/components/features/materials";
import { Material } from "@/interfaces";
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    ImportOutlined,
} from "@ant-design/icons";
import {
    Button,
    Empty,
    Flex,
    Input,
    InputNumber,
    Modal,
    Space,
    Table,
    TableProps,
    theme,
    Tooltip,
    Typography,
    message,
} from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
    formatPrice,
    parsePrice,
    restrictInputToNumbers,
    getPriceSymbol,
} from "@/utils";
import { materialService } from "@/services/materialService";

const { Title } = Typography;

interface ImportMaterialItem {
    material: Material;
    unitCost: number;
    addQuantity: number;
}

export default function ImportMaterialsPage() {
    const router = useRouter();
    const { token } = theme.useToken();
    const [importList, setImportList] = useState<ImportMaterialItem[]>([]);
    const [editingItem, setEditingItem] = useState<ImportMaterialItem | null>(null);
    const [editType, setEditType] = useState<"quantity" | "unitCost" | null>(null);
    const [tempQuantity, setTempQuantity] = useState<number>(1);
    const [tempUnitCost, setTempUnitCost] = useState<string>("0");
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<any>(null);

    // ✅ Import một item
    const handleImportOne = async (item: ImportMaterialItem) => {
        try {
            setLoading(true);
            await materialService.importMaterial({
                materialId: item.material.id,
                quantity: item.addQuantity,
                pricePerUnit: item.unitCost,
            });
            message.success(`Imported ${item.material.name} successfully!`);
            setImportList(prev => prev.filter(i => i.material.id !== item.material.id));
        } catch (error) {
            console.error(error);
            message.error("Failed to import material");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Import tất cả item
    const handleImportAll = async () => {
        if (importList.length === 0) {
            message.warning("No materials to import!");
            return;
        }

        Modal.confirm({
            title: "Confirm Import All",
            content: "Are you sure you want to import all listed materials?",
            okText: "Yes, Import All",
            okButtonProps: { type: "primary" },
            cancelText: "Cancel",
            async onOk() {
                try {
                    setLoading(true);
                    await Promise.all(
                        importList.map(item =>
                            materialService.importMaterial({
                                materialId: item.material.id,
                                quantity: item.addQuantity,
                                pricePerUnit: item.unitCost,
                            })
                        )
                    );
                    message.success("All materials imported successfully!");
                    setImportList([]);
                } catch (error) {
                    console.error(error);
                    message.error("Failed to import all materials");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Cập nhật quantity
    const handleQuantityChange = (id: number, newQuantity: number) => {
        setImportList(prev =>
            prev.map(item =>
                item.material.id === id
                    ? { ...item, addQuantity: newQuantity }
                    : item
            )
        );
    };

    // Cập nhật unit cost
    const handleUnitCostChange = (id: number, newCost: number) => {
        setImportList(prev =>
            prev.map(item =>
                item.material.id === id
                    ? { ...item, unitCost: newCost }
                    : item
            )
        );
    };

    // Mở modal chỉnh sửa
    const openEditModal = (record: ImportMaterialItem, type: "quantity" | "unitCost") => {
        setEditingItem(record);
        setEditType(type);
        setTempQuantity(record.addQuantity);
        setTempUnitCost(record.unitCost.toString());
    };

    const handleModalOk = () => {
        if (editingItem && editType === "quantity") {
            handleQuantityChange(editingItem.material.id, tempQuantity);
        }
        if (editingItem && editType === "unitCost") {
            handleUnitCostChange(editingItem.material.id, parsePrice(tempUnitCost));
        }
        setEditingItem(null);
        setEditType(null);
    };

    const handleRemove = (id: number) => {
        setImportList(prev => prev.filter(item => item.material.id !== id));
    };

    const columns: TableProps<ImportMaterialItem>["columns"] = [
        {
            title: "Name",
            dataIndex: ["material", "name"],
            key: "name",
        },
        {
            title: "Code",
            dataIndex: ["material", "code"],
            key: "code",
        },
        {
            title: "Import Quantity",
            key: "addQuantity",
            render: (_: any, record: ImportMaterialItem) => (
                <Button
                    iconPosition="end"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record, "quantity")}
                    style={{
                        color: token.colorPrimaryText,
                        background: token.colorFillAlter,
                        borderRadius: token.borderRadius,
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {record.addQuantity}
                </Button>
            ),
        },
        {
            title: "Unit Cost",
            key: "unitCost",
            render: (_: any, record: ImportMaterialItem) => (
                <Button
                    type="text"
                    iconPosition="end"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record, "unitCost")}
                    style={{
                        color: token.colorPrimaryText,
                        background: token.colorFillAlter,
                        borderRadius: token.borderRadius,
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {formatPrice(record.unitCost, { includeSymbol: true })}
                </Button>
            ),
        },
        {
            title: "Unit",
            dataIndex: ["material", "unit", "symbol"],
            key: "unit",
            render: (symbol: string) => symbol || "-",
        },
        {
            title: "Action",
            key: "action",
            width: 120,
            fixed: "right",
            align: "center",
            render: (_: any, record: ImportMaterialItem) => (
                <Space>
                    <Tooltip title="Import this material">
                        <Button
                            type="primary"
                            icon={<ImportOutlined />}
                            size="small"
                            loading={loading}
                            onClick={() => handleImportOne(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Delete this material">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleRemove(record.material.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            {/* Header */}
            <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
                <Space align="center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => router.push("/admin/materials")}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        Import Material
                    </Title>
                </Space>

                {importList.length > 0 && (
                    <Button
                        type="primary"
                        icon={<ImportOutlined />}
                        loading={loading}
                        onClick={handleImportAll}
                    >
                        Import All
                    </Button>
                )}
            </Flex>

            {/* Search Selector */}
            <div ref={searchRef}>
                <MaterialSearchSelector
                    style={{ width: "100%", height: 40, marginBottom: token.marginXXL }}
                    onSelect={(material) => {
                        if (material) {
                            setImportList(prev => {
                                const existing = prev.find(item => item.material.id === material.id);
                                if (existing) {
                                    return prev.map(item =>
                                        item.material.id === material.id
                                            ? { ...item, addQuantity: item.addQuantity + 1 }
                                            : item
                                    );
                                } else {
                                    return [
                                        ...prev,
                                        { material, addQuantity: 1, unitCost: 0 },
                                    ];
                                }
                            });
                            message.success("Import successful");

                        }
                    }}
                />
            </div>

            {/* Table or Empty state */}
            {importList.length === 0 ? (
                <Flex
                    vertical
                    align="center"
                    justify="center"
                    style={{
                        padding: 20,
                        border: "1px dashed #d9d9d9",
                        borderRadius: 8,
                    }}
                >
                    <Empty
                        description="No materials selected for import"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: token.marginSM }}
                        onClick={() => {
                            const input = document.querySelector(
                                "input.ant-select-selection-search-input"
                            ) as HTMLInputElement;
                            input?.focus();
                        }}
                    >
                        Search and Select Material
                    </Button>
                </Flex>
            ) : (
                <Table
                    columns={columns}
                    dataSource={importList}
                    rowKey={(r) => r.material.id}
                    pagination={false}
                    bordered
                    scroll={importList.length > 0 ? { x: "max-content" } : undefined}
                />
            )}

            {/* Modal chỉnh sửa */}
            <Modal
                title={editType === "quantity" ? "Edit Quantity" : "Edit Unit Cost"}
                open={!!editingItem}
                onOk={handleModalOk}
                onCancel={() => { setEditingItem(null); setEditType(null); }}
                okText="Save"
            >
                <Flex vertical gap={8}>
                    <Typography.Text strong>
                        {editingItem?.material.name}
                    </Typography.Text>
                    {editType === "quantity" ? (
                        <InputNumber
                            min={1}
                            value={tempQuantity}
                            onChange={(v) => setTempQuantity(v ?? 1)}
                            style={{ width: "100%" }}
                        />
                    ) : (
                        <Input
                            value={tempUnitCost}
                            onChange={(e) => setTempUnitCost(e.target.value)}
                            onKeyDown={restrictInputToNumbers}
                            placeholder="Enter unit cost"
                            addonAfter={getPriceSymbol()}
                        />
                    )}
                </Flex>
            </Modal>
        </>
    );
}
