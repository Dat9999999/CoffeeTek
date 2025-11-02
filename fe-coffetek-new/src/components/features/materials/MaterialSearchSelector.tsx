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

export const MaterialSearchSelector = ({
    onSelect,
    style,
}: MaterialSearchSelectorProps) => {
    const { token } = theme.useToken();
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<MaterialValue[]>([]);
    const [mounted, setMounted] = useState(false);
    const [value, setValue] = useState<any>(null); // ✅ controlled value
    const selectRef = useRef<any>(null);
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

            const newOptions = await fetchMaterials(searchValue);
            if (fetchId !== fetchRef.current) return;

            // nếu search === code thì auto chọn
            const trimmedSearch = searchTextRef.current;
            const exactMatch = newOptions.find(
                (o) => o.material.code === trimmedSearch
            );
            if (exactMatch) {
                handleChange(exactMatch, exactMatch);
                setFetching(false);
                return;
            }

            setOptions(newOptions);
            isEmptyRef.current = newOptions.length === 0 && trimmedSearch !== "";
            setFetching(false);
        };
        return debounce(loadOptions, 300);
    }, []);

    const handleChange = (newValue: MaterialValue, option: any) => {
        console.log(" newValue:", newValue);
        console.log(" option:", option);

        if (onSelect) {
            const material = option?.material;
            onSelect(material || null);
        }

        // ✅ reset input value để xoá text
        setValue("");
        searchTextRef.current = "";
        setOptions([]);
        isEmptyRef.current = false;
        setFetching(false);

        // ✅ giữ focus lại sau khi clear input
        requestAnimationFrame(() => {
            selectRef.current?.focus?.();
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);

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
            searchValue={value} // ✅ controlled
            placeholder="Search materials..."
            style={{ backgroundColor: token.colorBgBase, ...style }}
            filterOption={false}
            onSearch={(val) => {
                setValue(val);
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
                    ) : searchTextRef.current.trim() && !fetching && isEmptyRef.current ? (
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
                        <span className="text-xs text-gray-500">Code: {m.code}</span>
                    </div>
                );
            }}
        />
    );
};
