"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService, UserLoginInfo } from "@/services";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

interface AuthContextType {
    user: UserLoginInfo | null;
    setUser: React.Dispatch<React.SetStateAction<UserLoginInfo | null>>;
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserLoginInfo | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const cachedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);
                if (cachedUser) setUser(JSON.parse(cachedUser));

                const res = await authService.getUserLoginInfo();
                setUser(res);
                localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(res));
                setIsAuthenticated(true);
            } catch (err) {
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_INFO);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
    return ctx;
};
