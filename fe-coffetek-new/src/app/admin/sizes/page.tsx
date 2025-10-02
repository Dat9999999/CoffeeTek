"use client"

import { useState, useEffect } from "react"
import AdminPageHeader from "@/components/commons/AdminPageHeader"
import HeaderActionButton from "@/components/commons/CreateButton"
import SizeCreateSheet from "@/components/features/sizes/SizeCreateSheet"
import FilterActions from "@/components/features/sizes/FilterActions"
import { sizeService } from "@/services/sizeService"
import { Size } from "@/interfaces"
import SizeTable from "@/components/features/sizes/SizeTable"

export default function SizesPage() {
    const [openCreateSheet, setOpenCreateSheet] = useState(false)
    const [tableState, setTableState] = useState({
        data: [] as Size[],
        meta: { total: 0, page: 1, size: 10, totalPages: 1 },
    })
    const [tableLoading, setTableLoading] = useState(true)

    const [params, setParams] = useState({
        page: 1,
        size: 10,
        orderBy: "id",
        orderDirection: "asc" as "asc" | "desc",
        search: "",
    })

    const fetchSizes = async () => {
        setTableLoading(true)
        try {
            const response = await sizeService.getAll(params)
            setTableState({
                data: response.data,
                meta: response.meta,
            })
            setTableLoading(false)
        } catch (error) {
            console.error("Failed to fetch sizes:", error)
            setTableLoading(false)
        }
    }

    useEffect(() => {
        fetchSizes()
    }, [params])

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Size Management">
                <HeaderActionButton label="Add Size" onClick={() => setOpenCreateSheet(true)} />
            </AdminPageHeader>

            <FilterActions
                onApply={(filters) =>
                    setParams((prev) => ({
                        ...prev,
                        page: 1,
                        search: filters.search || "",
                    }))
                }
                onClear={() =>
                    setParams({
                        page: 1,
                        size: 10,
                        orderBy: "id",
                        orderDirection: "asc",
                        search: "",
                    })
                }
                initialValues={{
                    search: params.search,
                }}
            />

            <SizeTable
                tableState={tableState}
                setParams={setParams}
                loading={tableLoading}
                onDetail={(row) => console.log("View details for:", row)}
                onEdit={(row) => console.log("Edit size:", row)}
                onDelete={(row) => console.log("Delete size:", row)}
            />

            <SizeCreateSheet
                onCreated={fetchSizes}
                open={openCreateSheet}
                onOpenChange={setOpenCreateSheet}
            />
        </div>
    )
}