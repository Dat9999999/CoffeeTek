"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function FilterClearButton({
    onClear,
    disabled,
}: {
    onClear: () => void
    disabled?: boolean
}) {
    return (
        <Button variant="ghost" onClick={onClear} disabled={disabled}>
            <XCircle className="w-4 h-4 mr-2" />
            Clear Filters
        </Button>
    )
}
