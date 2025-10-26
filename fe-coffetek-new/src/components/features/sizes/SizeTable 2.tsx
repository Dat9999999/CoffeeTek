"use client"

import React from "react"
import DataTable, { ColumnConfig } from "@/components/commons/DataTable"
import { Size } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SizeTableProps {
    tableState: {
        data: Size[]
        meta: { total: number; page: number; size: number; totalPages: number }
    }
    setParams: React.Dispatch<React.SetStateAction<any>>
    loading: boolean
    onDetail?: (row: Size) => void
    onEdit?: (row: Size) => void
    onDelete?: (row: Size) => void
}

export default function SizeTable({
    tableState,
    setParams,
    loading, onDetail,
    onEdit,
    onDelete, }: SizeTableProps) {
    const sizeColumns: ColumnConfig<Size>[] = [
        {
            accessorKey: "id",
            header: ({ setParams }: any) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        setParams((prev: any) => ({
                            ...prev,
                            orderBy: "id",
                            orderDirection:
                                prev.orderBy === "id" && prev.orderDirection === "asc"
                                    ? "desc"
                                    : "asc",
                        }))
                    }
                >
                    ID
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }: any) => <div>{row.id}</div>,
        },
        {
            accessorKey: "name",
            header: ({ setParams }: any) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        setParams((prev: any) => ({
                            ...prev,
                            orderBy: "name",
                            orderDirection:
                                prev.orderBy === "name" && prev.orderDirection === "asc"
                                    ? "desc"
                                    : "asc",
                        }))
                    }
                >
                    Name
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }: any) => <div>{row.name}</div>,
        },
        {
            accessorKey: "sort_index",
            header: ({ setParams }: any) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        setParams((prev: any) => ({
                            ...prev,
                            orderBy: "sort_index",
                            orderDirection:
                                prev.orderBy === "sort_index" &&
                                    prev.orderDirection === "asc"
                                    ? "desc"
                                    : "asc",
                        }))
                    }
                >
                    Sort Index
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }: any) => <div>{row.sort_index}</div>,
        },
        {
            accessorKey: "actions",
            cell: ({ row }: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onDetail?.(row)}>
                            Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(row)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete?.(row)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <DataTable<Size>
            columns={sizeColumns}
            data={tableState.data}
            meta={tableState.meta}
            setParams={setParams}
            loading={loading}
        />
    )
}
