"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export default function FilterToggleButton({
    onClick,
}: {
    onClick: () => void
}) {
    return (
        <Button variant="outline" onClick={onClick}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
        </Button>
    )
}
