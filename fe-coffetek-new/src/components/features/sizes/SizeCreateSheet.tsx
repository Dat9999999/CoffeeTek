"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { sizeService } from "@/services/sizeService"
import { toast } from "sonner"

export default function SizeCreateSheet({
    open,
    onOpenChange,
    onCreated,   // ✅ callback từ cha
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onCreated?: () => void
}) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.warning("Please enter a size name")
            return
        }

        try {
            setLoading(true)
            const newSize = await sizeService.create({
                name: name,
                sort_index: 3,
            })

            toast.success(`Created size: ${newSize.name}`)

            // đóng sheet + reset form
            onOpenChange(false)
            setName("")

            // ✅ gọi callback để reload
            onCreated?.()

        } catch (error) {
            console.error("Error creating size", error)
            toast.error("Failed to create size. Please try again!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[480px]">
                <SheetHeader>
                    <SheetTitle>Add Size</SheetTitle>
                    <SheetDescription>
                        Enter the new size information below.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid flex-1 auto-rows-min gap-6 px-2 mt-4">
                    <div className="grid gap-3">
                        <Label htmlFor="size-name">Size Name</Label>
                        <Input
                            id="size-name"
                            placeholder="e.g. XL, 42, Custom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
