"use client";

import { useDarkMode } from "@/components/providers";
import { Button, Flex } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

export function AdminDarkModeToggleMini() {
    const { mode, toggleMode } = useDarkMode();
    const isDark = mode === "dark";

    return (
        <Flex
            justify="flex-start"
            onClick={toggleMode}
            style={{
                color: isDark ? "#fadb14" : "#555",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}
        >
            {isDark ? <MoonOutlined /> : <SunOutlined />}
            <span>{isDark ? "Dark" : "Light"}</span>
        </Flex>
    );
}
