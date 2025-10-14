"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SizeFilterSheet({
    open,
    onOpenChange,
    onApply,
    defaultFilters,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onApply: (filters: any) => void
    defaultFilters?: any
}) {
    const [name, setName] = useState(defaultFilters?.name || "")
    const [orderDirection, setOrderDirection] = useState(defaultFilters?.orderDirection || "asc")

    const handleApply = () => {
        onApply({ name, orderDirection })
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[350px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filter Sizes</SheetTitle>
                    <SheetDescription>Choose your filter conditions below.</SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 mt-4">
                    <div>
                        <Label htmlFor="size-name">Size Name</Label>
                        <Input
                            id="size-name"
                            placeholder="Enter size name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Order</Label>
                        <select
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={orderDirection}
                            onChange={(e) => setOrderDirection(e.target.value)}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <Button className="w-full" onClick={handleApply}>
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
