"use client";

import { usePathname } from "next/navigation";
import { NewOrderNotifier } from "./NewOrderNotifier";

export function GlobalNotifiers() {
    const pathname = usePathname();

    if (pathname === "/pos") {
        return null;
    }

    return <NewOrderNotifier />;
}
