"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterValues {
    search?: string
}

export default function FilterActions({
    onApply,
    onClear,
    initialValues,
}: {
    onApply: (values: FilterValues) => void
    onClear: () => void
    initialValues?: FilterValues
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState(initialValues?.search || "")

    const handleApply = () => {
        onApply({ search })
        setOpen(false)
    }

    const handleClear = () => {
        setSearch("")
        onClear()
    }

    const hasFilters = !!initialValues?.search // Kiểm tra nếu có filter search được áp dụng

    return (
        <div className="flex items-center gap-2">
            {/* Nút mở dialog */}
            <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(true)}>
                <Filter className="w-4 h-4 mr-1" /> Filters
            </Button>

            {/* Nút clear filter - chỉ hiển thị khi có filter */}
            {hasFilters && (
                <Button
                    variant="destructive"
                    onClick={handleClear}
                    className="cursor-pointer"
                >
                    <XCircle className="w-4 h-4 mr-1" /> Clear
                </Button>
            )
            }

            {/* Dialog filter */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                        <DialogDescription>
                            Set conditions to filter the size list
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2">Search by name</label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="e.g. XL, 42"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}