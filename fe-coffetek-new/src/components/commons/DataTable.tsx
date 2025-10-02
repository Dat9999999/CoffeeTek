"use client"

import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Inbox } from "lucide-react"
import LoadingTable from "./LoadingTable"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface ColumnConfig<T> {
    accessorKey: string
    header?: ({ setParams }: any) => React.ReactNode
    cell: ({ row }: { row: T }) => React.ReactNode
}
interface DataTableProps<T> {
    columns: ColumnConfig<T>[]
    data: T[]
    meta: { total: number; page: number; size: number; totalPages: number }
    setParams: React.Dispatch<React.SetStateAction<any>>
    loading?: boolean
}

export default function DataTable<T>({
    columns,
    data,
    meta,
    setParams,
    loading = false,
}: DataTableProps<T>) {
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= meta.totalPages) {
            setParams((prev: any) => ({ ...prev, page }))
        }
    }

    const handlePageSizeChange = (newSize: number) => {
        setParams((prev: any) => ({
            ...prev,
            size: newSize,
            page: 1, // reset về trang đầu khi đổi size
        }))
    }

    return (
        <div className="relative overflow-hidden">
            <Table className="rounded-md border">
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            column.header ? <TableHead key={column.accessorKey}>
                                {column.header({ setParams })}
                            </TableHead> : null
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row: T, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((column) => (
                                    <TableCell key={column.accessorKey}>
                                        {column.cell({ row })}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : !data.length && !loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <div className="flex items-center justify-center gap-2 w-full py-4">
                                    <Inbox className="h-5 w-5 text-muted-foreground" />
                                    No data
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <div className="flex items-center justify-center gap-2 w-full py-4">
                                    Loading data ...
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {data.length > 0 && (
                <div className="flex justify-end items-center mt-4 gap-4 w-full">
                    {/* Showing */}
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Showing {(meta.page - 1) * meta.size + 1}–
                        {Math.min(meta.page * meta.size, meta.total)} of {meta.total}
                    </div>

                    {/* Pagination */}
                    <div>
                        <Pagination>
                            <PaginationContent className="flex items-center gap-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(meta.page - 1)}
                                        className={
                                            meta.page === 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={page === meta.page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(meta.page + 1)}
                                        className={
                                            meta.page === meta.totalPages
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>

                    {/* Select page size */}
                    <div>
                        <Select
                            value={String(meta.size)}
                            onValueChange={(value) => handlePageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder={`${meta.size} / page`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="15">15 / page</SelectItem>
                                <SelectItem value="20">20 / page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            {/* Footer: Showing + Pagination + PageSize */}


            {/* Overlay Loading */}
            {loading && <LoadingTable />}
        </div>
    )
}
