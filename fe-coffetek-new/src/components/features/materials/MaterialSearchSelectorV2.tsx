"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Select, Skeleton, Spin, theme } from "antd";
import { InboxOutlined, SearchOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";
import { Material } from "@/interfaces";
import { materialService } from "@/services/materialService";

interface MaterialSearchSelectorProps {
    onSelect?: (material: Material | null) => void;
    style?: React.CSSProperties;
    selectedValue?: Material | null; // ✅ material đang được chọn (edit)
}

interface MaterialValue {
    label: string;
    value: number;
    material: Material;
}

const fetchMaterials = async (search: string): Promise<MaterialValue[]> => {
    try {
        const trimmed = search.trim();
        if (trimmed === "") return [];

        const response = await materialService.getAll({
            searchName: trimmed,
            size: 10,
            page: 1,
            orderBy: "name",
            orderDirection: "asc",
        });

        const materials = response.data || response || [];
        return materials.map((m: Material) => ({
            label: m.name,
            value: m.id,
            material: m,
        }));
    } catch (error) {
        console.error("Error fetching materials:", error);
        return [];
    }
};

export const MaterialSearchSelectorV2 = ({
    onSelect,
    style,
    selectedValue,
}: MaterialSearchSelectorProps) => {
    const { token } = theme.useToken();
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<MaterialValue[]>([]);
    const [mounted, setMounted] = useState(false);
    const [searchValue, setSearchValue] = useState<string>(""); // controlled input text
    const selectRef = useRef<any>(null);
    const fetchRef = useRef(0);
    const isEmptyRef = useRef<boolean>(false);

    // ✅ Đây là giá trị thực của Select (label + value)
    const [selectedOption, setSelectedOption] = useState<any>(
        selectedValue
            ? { label: selectedValue.name, value: selectedValue.id }
            : null
    );

    const debounceFetcher = useMemo(() => {
        const loadOptions = async (searchValue: string) => {
            const trimmed = searchValue.trim();
            fetchRef.current += 1;
            const fetchId = fetchRef.current;

            setFetching(true);
            const newOptions = await fetchMaterials(trimmed);
            if (fetchId !== fetchRef.current) return;

            setOptions(newOptions);
            isEmptyRef.current = newOptions.length === 0 && trimmed !== "";
            setFetching(false);

            // ✅ Auto select nếu text search trùng với mã vật liệu (code)
            const matched = newOptions.find(
                (opt) =>
                    opt.material.code?.toLowerCase() === trimmed.toLowerCase()
            );
            if (matched) {
                handleChange(
                    { value: matched.value, label: matched.label },
                    matched
                );

                // ✅ Dọn dẹp & blur sau khi auto-select
                setSearchValue(""); // clear search text
                setOptions([]); // clear dropdown
                // đóng dropdown và blur khỏi input
                setTimeout(() => {
                    selectRef.current?.blur?.();
                    // selectRef.current?.focus?.(false); // tránh antd auto re-focus
                }, 100);
            }

        };
        return debounce(loadOptions, 300);
    }, []);
    ;

    const handleChange = (newValue: any, option: any) => {
        const material = option?.material;
        if (onSelect) onSelect(material || null);
        setSelectedOption({
            label: material?.name || "",
            value: material?.id || "",
        });
    };

    // ✅ mount skeleton
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);

    // ✅ cập nhật lại khi edit mở modal
    useEffect(() => {
        if (selectedValue) {
            setSelectedOption({
                label: selectedValue.name,
                value: selectedValue.id,
            });
        } else {
            setSelectedOption(null);
        }
    }, [selectedValue]); // ✅ fix: dependency đúng

    if (!mounted) {
        return (
            <Skeleton.Input active block style={{ height: "32px", ...style }} />
        );
    }

    return (
        <Select
            ref={selectRef}
            showSearch
            labelInValue
            value={selectedOption} // ✅ hiển thị giá trị hiện tại
            searchValue={searchValue}
            placeholder="Search materials..."
            style={{ backgroundColor: token.colorBgBase, ...style }}
            filterOption={false}
            onSearch={(val) => {
                setSearchValue(val);
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
                <div>
                    {fetching ? (
                        <div style={{ minHeight: "20vh" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "100%",
                                }}
                            >
                                <Spin size="small" />
                            </div>
                        </div>
                    ) : searchValue.trim() && !fetching && isEmptyRef.current ? (
                        <div style={{ minHeight: "20vh" }}>
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: token.colorTextDescription,
                                    paddingTop: "12px",
                                }}
                            >
                                <InboxOutlined style={{ fontSize: 32 }} />
                                <div>No data</div>
                            </div>
                        </div>
                    ) : null}
                </div>
            }
            suffixIcon={<SearchOutlined />}
            options={options.map((option) => ({
                label: option.label,
                value: option.value,
                material: option.material,
            }))}
            optionRender={(option) => {
                const m = option.data.material as Material;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {m.name} ({m.unit?.symbol || "-"})
                        </span>
                        <span className="text-xs text-gray-500">
                            Code: {m.code}
                        </span>
                    </div>
                );
            }}
        />
    );
};
