'use client';

import { Select, theme } from "antd";

interface ProductTypeSelectorProps {
    value?: boolean; // true = topping, false = product
    onChange?: (value: boolean) => void;
}

export function ProductTypeSelector({
    value = false,
    onChange,
}: ProductTypeSelectorProps) {
    const { token } = theme.useToken();

    return (
        <Select
            placeholder="Select type"
            style={{
                marginRight: token.marginXS,
                minWidth: 120,
            }}

            value={value ? "topping" : "product"}
            onChange={(val) => onChange?.(val === "topping")}
            options={[
                { value: "product", label: "Product" },
                { value: "topping", label: "Topping" },
            ]}
        />
    );
}
