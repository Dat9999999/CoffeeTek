"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

type Mode = "light" | "dark";

interface DarkModeContextProps {
    mode: Mode;
    toggleMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<Mode>("light");

    const toggleMode = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
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
