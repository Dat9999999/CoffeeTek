import { Loader2 } from "lucide-react";

export default function LoadingTable() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

}

