
"use client";
import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "antd";
import type { UploadFile } from "antd";

interface DraggableUploadListItemProps {
    originNode: React.ReactElement;
    file: UploadFile;
}

export const DraggableUploadListItem: React.FC<DraggableUploadListItemProps> = ({
    originNode,
    file,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: file.uid });

    const [loaded, setLoaded] = useState(false);

    // Theo dõi khi ảnh tải xong (nếu có URL)
    useEffect(() => {
        if (file.url) {
            const img = new Image();
            img.src = file.url;
            img.onload = () => setLoaded(true);
            img.onerror = () => setLoaded(true);
        } else {
            // Ảnh mới (base64) thì coi như đã load
            setLoaded(true);
        }
    }, [file.url]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        opacity: isDragging ? 0.6 : 1,
        position: "relative",

    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {/* Hiệu ứng Skeleton khi ảnh chưa load */}
            {!loaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        overflow: "hidden",
                    }}
                >
                    <Skeleton.Image
                        active
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            )}
            <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
                {originNode}
            </div>
        </div>
    );
};
