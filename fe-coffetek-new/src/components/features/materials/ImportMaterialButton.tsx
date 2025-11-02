"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { ImportOutlined } from "@ant-design/icons";

export const ImportMaterialButton = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/admin/materials/import");
    };

    return (
        <Button type="primary" icon={<ImportOutlined />} onClick={handleClick}>
            Import
        </Button>
    );
};
