"use client"

type Props = {
    title: string
    children?: React.ReactNode
}

export default function AdminPageHeader({ title, children }: Props) {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-secondary rounded-md">
            <h1 className="font-semibold text-lg">{title}</h1>
            {children}
        </div>
    )
}
