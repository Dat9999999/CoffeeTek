"use client";

import React, { ReactNode, createContext, useContext } from "react";
import { useTheme } from "next-themes";

type Mode = "light" | "dark";

interface DarkModeContextProps {
    mode: Mode;
    toggleMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const { theme, systemTheme, setTheme } = useTheme();

    // Nếu theme = "system" thì lấy theo systemTheme
    const resolvedTheme = theme === "system" ? systemTheme : theme;
    const mode = (resolvedTheme === "dark" ? "dark" : "light") as Mode;

    const toggleMode = () => {
        setTheme(mode === "light" ? "dark" : "light");
    };

    return (
        <DarkModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (!context) throw new Error("useDarkMode must be used inside DarkModeProvider");
    return context;
}
