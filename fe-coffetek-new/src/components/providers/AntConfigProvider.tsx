"use client";

import { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";
import { useDarkMode } from "@/components/providers";

import { useMemo } from "react";

export function AntConfigProvider({ children }: { children: ReactNode }) {
    const { mode } = useDarkMode();

    const themeConfig = useMemo(
        () => ({
            algorithm:
                mode === "dark"
                    ? [theme.darkAlgorithm, theme.compactAlgorithm]
                    : [theme.defaultAlgorithm, theme.compactAlgorithm],
        }),
        [mode]
    );

    return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}

