"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Hash, Tag, DollarSign, Package, CheckCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// bazza/ui generated component + helpers
import { DataTableFilter, useDataTableFilters } from "@/components/data-table-filter"
import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters"

type Product = {
    id: number
    name: string
    category: string
    price: number
    status: string
}

/* ======== column config (builder) ======== */
const dtf = createColumnConfigHelper<Product>()

const columnsConfig = [
    dtf
        .number()
        .id("id")
        .accessor((r) => r.id)
        .displayName("ID")
        .icon(Hash)   //  bắt buộc
        .build(),

    dtf
        .text()
        .id("name")
        .accessor((r) => r.name)
        .displayName("Name")
        .icon(Tag)
        .build(),

    dtf
        .option()
        .id("category")
        .accessor((r) => r.category)
        .displayName("Category")
        .icon(Package)
        .build(),

    dtf
        .number()
        .id("price")
        .accessor((r) => r.price)
        .displayName("Price")
        .icon(DollarSign)
        .build(),

    dtf
        .option()
        .id("status")
        .accessor((r) => r.status)
        .displayName("Status")
        .icon(CheckCircle)
        .build(),
] as const


/* ======== demo data + options ======== */
const demoProducts: Product[] = [
    { id: 1, name: "Sample Product", category: "electronics", price: 100, status: "active" },
    { id: 2, name: "Another Product", category: "clothing", price: 50, status: "inactive" },
    { id: 3, name: "Book Example", category: "books", price: 20, status: "active" },
]

const categoryOptions = [
    { label: "Electronics", value: "electronics" },
    { label: "Clothing", value: "clothing" },
    { label: "Books", value: "books" },
]

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
]

export default function ProductsPage() {
    // create the filters instance (client-side strategy)
    const { columns, filters, actions, strategy } = useDataTableFilters({
        strategy: "client",
        data: demoProducts,
        columnsConfig,
        options: {
            category: categoryOptions,
            status: statusOptions,
        },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-semibold text-lg">Product Management</h1>
                <Button variant="outline">Create Product</Button>
            </div>

            {/* DataTableFilter (uses the hook instance) */}
            <DataTableFilter
                filters={filters}
                columns={columns}
                actions={actions}
                strategy={strategy}
            />

            {/* Table (demo only, shows original demoProducts) */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {demoProducts.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.id}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.category}</TableCell>
                                <TableCell>${p.price}</TableCell>
                                <TableCell>{p.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
