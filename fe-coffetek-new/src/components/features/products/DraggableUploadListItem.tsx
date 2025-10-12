import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "move",
        opacity: isDragging ? 0.6 : 1,
    };

    // Wrap originNode instead of touching originNode.props
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={isDragging ? "is-dragging" : ""}
        >
            {originNode}
        </div>
    );
};
