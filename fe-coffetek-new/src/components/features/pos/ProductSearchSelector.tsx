import { Product } from "@/interfaces";
import { SearchOutlined } from "@ant-design/icons";
import { Select, SelectProps } from "antd";
import { useState } from "react";


interface ProductSearchSelectorProps {
    onSelect?: (product: Product | null) => void;
    style?: React.CSSProperties;
}

let timeout: ReturnType<typeof setTimeout> | null = null;
let currentValue: string = '';

const fetchData = async (
    value: string,
    callback: (data: { value: string; text: string }[]) => void
) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    currentValue = value;

    const fake = async () => {
        try {
            const response = await fetch(`https://api.github.com/search/users?q=${value}`);
            const { items } = await response.json();

            if (currentValue === value && Array.isArray(items)) {
                const data = items.map((user: any) => ({
                    value: user.login,
                    text: user.login,
                }));
                callback(data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("Lỗi khi fetch:", err);
            callback([]);
        }
    };

    if (value) {
        timeout = setTimeout(fake, 400);
    } else {
        callback([]);
    }
};



export const ProductSearchSelector = ({
    onSelect,
    style
}: ProductSearchSelectorProps) => {

    const [data, setData] = useState<SelectProps['options']>([]);
    const [value, setValue] = useState<string>();

    const handleSearch = (newValue: string) => {
        fetchData(newValue, setData);
    };

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };



    return (
        <>
            <Select
                showSearch
                value={value}
                placeholder="Search"
                style={style}
                defaultActiveFirstOption={false}
                filterOption={false}
                suffixIcon={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={handleChange}
                notFoundContent={null}
                options={(data || []).map((d) => ({
                    value: d.value,
                    label: d.text,
                }))}
            />
        </>

    );
};