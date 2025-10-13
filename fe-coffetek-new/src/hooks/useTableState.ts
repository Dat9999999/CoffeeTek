"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface TableState {
    currentPage: number;
    pageSize: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    search?: string;
    [key: string]: any; // Cho phép thêm filter động
}

export function useTableState(initial?: Partial<TableState>) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Khởi tạo state cơ bản từ initial
    const initialState: TableState = {
        currentPage: 1,
        pageSize: 10,
        search: "",
        ...initial,
    };

    // Parse tất cả params từ URL
    const parsedState: TableState = { ...initialState };
    for (const [key, value] of searchParams.entries()) {
        if (key === "page") {
            parsedState.currentPage = Number(value) || initialState.currentPage;
        } else if (key === "pageSize") {
            parsedState.pageSize = Number(value) || initialState.pageSize;
        } else if (key === "orderBy") {
            parsedState.orderBy = value || initialState.orderBy;
        } else if (key === "orderDirection") {
            if (value === "asc" || value === "desc") {
                parsedState.orderDirection = value;
            }
        } else if (key === "search") {
            parsedState.search = value || initialState.search;
        } else {
            // Các field động khác
            parsedState[key] = value;
        }
    }

    const [tableState, setTableState] = useState<TableState>(parsedState);

    // Khi tableState thay đổi => cập nhật URL
    // useEffect(() => {
    //     const params = new URLSearchParams();
    //     // Các field cơ bản
    //     params.set("page", String(tableState.currentPage));
    //     params.set("pageSize", String(tableState.pageSize));
    //     if (tableState.orderBy) params.set("orderBy", tableState.orderBy);
    //     if (tableState.orderDirection)
    //         params.set("orderDirection", tableState.orderDirection);
    //     if (tableState.search) params.set("search", tableState.search);
    //     // Các field bổ sung (vd: filterType)
    //     Object.keys(tableState).forEach((key) => {
    //         if (
    //             !["currentPage", "pageSize", "orderBy", "orderDirection", "search"].includes(
    //                 key
    //             )
    //         ) {
    //             const value = tableState[key];
    //             if (value !== undefined && value !== null && value !== "")
    //                 params.set(key, String(value));
    //         }
    //     });
    //     // Cập nhật URL mà không reload trang
    //     router.replace(`${pathname}?${params.toString()}`);
    // }, [tableState]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", String(tableState.currentPage));
        params.set("pageSize", String(tableState.pageSize));
        if (tableState.orderBy) params.set("orderBy", tableState.orderBy);
        if (tableState.orderDirection)
            params.set("orderDirection", tableState.orderDirection);
        if (tableState.search) params.set("search", tableState.search);

        Object.keys(tableState).forEach((key) => {
            if (!["currentPage", "pageSize", "orderBy", "orderDirection", "search"].includes(key)) {
                const value = tableState[key];
                if (value !== undefined && value !== null && value !== "")
                    params.set(key, String(value));
            }
        });

        const newUrl = `${pathname}?${params.toString()}`;
        if (newUrl !== `${pathname}?${searchParams.toString()}`) {
            router.replace(newUrl);
        }
    }, [tableState, pathname, router]);


    return { tableState, setTableState };
}