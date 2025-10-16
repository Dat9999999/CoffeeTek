'use client';
import React, { useState, useEffect } from "react";
import { Upload, Image, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import {
    DndContext,
    PointerSensor,
    useSensor,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableUploadListItem } from "./DraggableUploadListItem";
const { Text, Link } = Typography;

interface ProductImageUploaderProps {
    value?: UploadFile[];
    onChange?: (files: UploadFile[]) => void;
    maxCount?: number;
}


export const OnlyNewImageUploader: React.FC<ProductImageUploaderProps> = ({
    value = [],
    onChange,
    maxCount = 10,
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>(value);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFileList(value);
    }, [value]);

    const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
        const limited = newList.slice(-maxCount);
        const withSortIndex = limited.map((f, i) => ({
            ...f,
            sort_index: i,
        }));
        setFileList(withSortIndex);
        onChange?.(withSortIndex);
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setFileList((prev) => {
            const oldIndex = prev.findIndex((f) => f.uid === active.id);
            const newIndex = prev.findIndex((f) => f.uid === over.id);
            const reordered = arrayMove(prev, oldIndex, newIndex).map((f, i) => ({
                ...f,
                sort_index: i,
            }));
            onChange?.(reordered);
            return reordered;
        });
    };

    return (
        <>
            <DndContext sensors={[sensor]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fileList.map((f) => f.uid)} strategy={rectSortingStrategy}>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        multiple
                        beforeUpload={(file, fileListToAdd) => {
                            const total = fileList.length + fileListToAdd.length;
                            if (total > maxCount) {
                                message.open({
                                    key: "maxImageWarning", // fixed key to avoid repeating messages
                                    type: "warning",
                                    content: `You can upload a maximum of ${maxCount} images.`,
                                });
                                setError(`Maximum ${maxCount} images allowed.`);
                                return Upload.LIST_IGNORE;
                            }
                            setError(null);
                            return false;
                        }}
                        onChange={handleChange}
                        onPreview={handlePreview}
                        itemRender={(originNode, file) => (
                            <DraggableUploadListItem originNode={originNode} file={file} />
                        )}
                    >
                        {fileList.length >= maxCount ? null : (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                    {error && (
                        <Text type="danger">{error}</Text>
                    )}
                </SortableContext>
            </DndContext>

            {previewImage && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </>
    );
};

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
