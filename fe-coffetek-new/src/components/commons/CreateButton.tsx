"use client"

import { Button } from "@/components/ui/button"

type Props = {
    label: string
    onClick?: () => void
}

export default function CreateButton({ label, onClick }: Props) {
    return (
        <Button variant="outline" className="cursor-pointer" onClick={onClick}>
            {label}
        </Button>
    )
}
