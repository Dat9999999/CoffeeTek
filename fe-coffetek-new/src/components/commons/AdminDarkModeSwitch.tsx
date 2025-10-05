"use client";

import { Switch } from "antd";
import { useDarkMode } from "@/components/providers"; // đường dẫn context bạn

export function AdminDarkModeSwitch() {
    const { mode, toggleMode } = useDarkMode();

    return (
        <Switch
            checked={mode === "dark"}
            onChange={toggleMode}
            checkedChildren="🌙 Dark"
            unCheckedChildren="☀️ Light"
        />
    );
}
