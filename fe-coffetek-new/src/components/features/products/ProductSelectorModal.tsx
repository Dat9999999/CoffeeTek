"use client";

import { useState, useEffect } from "react";
import { Modal, Table, Input, Button, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { productService, GetAllProductsParams } from "@/services/productService";
import { Product } from "@/interfaces";
import { formatPriceProduct } from "@/utils";
import { CategorySelector } from "@/components/features/categories";
import { ProductTypeSelector } from "@/components/features/products/ProductTypeSelector";

interface ProductSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  initialSelectedProducts?: Product[];
}

interface TableState {
  currentPage: number;
  pageSize: number;
  search?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  categoryId?: number;
  isTopping?: boolean;
}

export function ProductSelectorModal({
  visible,
  onClose,
  onConfirm,
  initialSelectedProducts = [],
}: ProductSelectorModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);
  const [tableState, setTableState] = useState<TableState>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    orderBy: "id",
    orderDirection: "asc",
    isTopping: false,
  });

  useEffect(() => {
    if (visible) {
      setSelectedProducts(initialSelectedProducts);
    }
  }, [initialSelectedProducts, visible]);

  useEffect(() => {
    if (!visible) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: GetAllProductsParams = {
          page: tableState.currentPage,
          size: tableState.pageSize,
          search: tableState.search,
          orderBy: tableState.orderBy,
          orderDirection: tableState.orderDirection,
          categoryId: tableState.categoryId,
          isTopping: tableState.isTopping,
        };
        const response = await productService.getAll(params);
        setProducts(response.data || []);
        setTotal(response.meta.total || 0);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [tableState, visible]);

  const handleRowClick = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      return updated;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts((prev) => {
      if (selected) {
        const newOnPage = products.filter((p) => !prev.some((x) => x.id === p.id));
        return [...prev, ...newOnPage];
      } else {
        const ids = products.map((p) => p.id);
        return prev.filter((p) => !ids.includes(p.id));
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedProducts);
    onClose();
  };

  const handleTableChange = (pagination: any, _: any, sorter: any) => {
    setTableState((prev) => ({
      ...prev,
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      orderBy: sorter.field || prev.orderBy,
      orderDirection: sorter.order
        ? sorter.order === "ascend"
          ? "asc"
          : "desc"
        : prev.orderDirection,
    }));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: true,
      render: (_: number, record: Product) =>
        formatPriceProduct(record, { includeSymbol: true }),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (name?: string) => name || "N/A",
    },
  ];

  return (
    <Modal
      title="Select Products"
      open={visible}
      width={900}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Confirm"
      cancelText="Cancel"
      getContainer={false}
      destroyOnClose
    >
      <Flex gap={16} wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search products"
          prefix={<SearchOutlined />}
          value={tableState.search}
          onChange={(e) =>
            setTableState({ ...tableState, search: e.target.value, currentPage: 1 })
          }
          style={{ width: 300 }}
        />
        <ProductTypeSelector
          value={tableState.isTopping === true}
          onChange={(val) =>
            setTableState({
              ...tableState,
              isTopping: val,
              currentPage: 1,
              categoryId: undefined,
            })
          }
        />
        {!tableState.isTopping && (
          <CategorySelector
            value={tableState.categoryId ?? null}
            onChange={(val) =>
              setTableState({
                ...tableState,
                categoryId: val ?? undefined,
                currentPage: 1,
              })
            }
          />
        )}
      </Flex>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: tableState.currentPage,
          pageSize: tableState.pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        rowSelection={{
          selectedRowKeys: selectedProducts.map((p) => p.id),
          onSelect: (record) => handleRowClick(record),
          onSelectAll: handleSelectAll,
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        onChange={handleTableChange}
      />
    </Modal>
  );
}
