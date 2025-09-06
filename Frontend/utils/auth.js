import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";
export function getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}