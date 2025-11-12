"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuardInner>{children}</AuthGuardInner>;
}

function AuthGuardInner({ children }: { children: React.ReactNode }) {
    const { loading, isAuthenticated } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace("/auth/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading)
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
