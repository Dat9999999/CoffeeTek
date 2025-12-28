import { Product } from "@/interfaces";
import { SearchOutlined } from "@ant-design/icons";
import { Empty, Select, Skeleton, Spin, theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { productService } from "@/services";
import debounce from "lodash/debounce";
import { ProductOptionItem } from "./ProductOptionItem";

interface ProductSearchSelectorProps {
    onSelect?: (product: Product | null) => void;
    style?: React.CSSProperties;
}

interface ProductValue {
    label: string;
    value: number;
    product: Product;
}


const fetchProducts = async (search: string): Promise<ProductValue[]> => {
    try {
        search = search.trim();
        if (search === "") return [];
        const response = await productService.getAll({
            search,
            size: 10,
            page: 1,
            orderBy: "name",
            orderDirection: "asc",
        });
        const products = response.data || [];
        return products.map((product: Product) => ({
            label: product.name,
            value: product.id,
            product,
        }));
    } catch (err) {
        console.error("ERROR:", err);
        return [];
    }
};

export const ProductSearchSelector = ({
    onSelect,
    style,
}: ProductSearchSelectorProps) => {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<ProductValue[]>([]);
    const [mounted, setMounted] = useState(false);
    const searchTextRef = useRef<string>("");
    const isEmptyRef = useRef<boolean>(false);
    const fetchRef = useRef(0);

    const debounceFetcher = useMemo(() => {
        const loadOptions = async (searchValue: string) => {
            searchTextRef.current = searchValue.trim();
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            const newOptions = await fetchProducts(searchValue);
            if (fetchId !== fetchRef.current) {
                return;
            }
            setOptions(newOptions);
            isEmptyRef.current = newOptions.length === 0 && searchTextRef.current !== "";
            setFetching(false);
        };
        return debounce(loadOptions, 300);
    }, []);

    const handleChange = (newValue: ProductValue, option: any) => {
        // Gọi callback onSelect
        if (onSelect) {
            onSelect(newValue ? newValue.product : null);
        }
        // Reset trạng thái
        searchTextRef.current = ""; // Xóa văn bản tìm kiếm
        setOptions([]); // Xóa danh sách options
        isEmptyRef.current = false; // Đặt lại trạng thái isEmpty
        setFetching(false); // Đặt lại trạng thái fetching
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <Skeleton.Input active block style={{ height: "32px", ...style }} />;
    }

    return (
        <Select
            showSearch
            labelInValue
            value={null}
            placeholder="Tìm kiếm sản phẩm..."
            style={{
                fontSize: 18,
                ...style
            }}
            size="large"
            filterOption={false}
            onSearch={(val) => {
                searchTextRef.current = val;
                if (val.trim() === "") {
                    setOptions([]);
                    isEmptyRef.current = false;
                    setFetching(false);
                    return;
                }
                debounceFetcher(val);
            }}
            onChange={handleChange}
            notFoundContent={
                fetching ? (
                    <Spin style={{ margin: "8px auto", display: "block" }} size="small" />
                ) : searchTextRef.current.trim() && !fetching && isEmptyRef.current ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy" />
                ) : null
            }
            suffixIcon={<SearchOutlined style={{ fontSize: 20 }} />}
            options={options.map((option) => ({
                label: option.label,
                value: option.value,
                product: option.product,
            }))}

            optionRender={(option) => (
                <ProductOptionItem
                    label={String(option.label)}
                    product={option.data.product}
                />
            )}

        />
    );
};