"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

/**
 * Hook kiểm tra trạng thái đăng nhập.
 * - Nếu không có token -> tự redirect về trang login.
 * - Trả về { isAuthenticated, loading } để dùng trong component.
 */
export function useAuth(redirectIfUnauth = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (redirectIfUnauth) {
        router.push("/auth/login");
      }
    }
    setLoading(false);
  }, [router, redirectIfUnauth]);

  return { isAuthenticated, loading };
}
