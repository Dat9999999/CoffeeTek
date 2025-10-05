import { useState } from "react";

export interface TableState {
    currentPage: number;
    pageSize: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    search?: string;
}

export function useTableState(initial?: Partial<TableState>) {
    const [tableState, setTableState] = useState<TableState>({
        currentPage: 1,
        pageSize: 10,
        orderBy: undefined,
        orderDirection: undefined,
        search: "",
        ...initial,
    });

    return { tableState, setTableState };
}
