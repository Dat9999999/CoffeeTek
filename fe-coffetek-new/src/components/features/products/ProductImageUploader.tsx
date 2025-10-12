import React, { useState } from "react";
import { Upload, Image } from "antd";
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
} from "@dnd-kit/sortable";
import { DraggableUploadListItem } from "./DraggableUploadListItem";

interface ProductImageUploaderProps {
    value?: UploadFile[];
    onChange?: (files: UploadFile[]) => void;
    maxCount?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
    value = [],
    onChange,
    maxCount = 10,
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>(value);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });

    const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
        const limited = newList.slice(-maxCount);
        setFileList(limited);
        onChange?.(limited);
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
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const oldIndex = prev.findIndex((f) => f.uid === active.id);
                const newIndex = prev.findIndex((f) => f.uid === over?.id);
                const reordered = arrayMove(prev, oldIndex, newIndex);
                onChange?.(reordered);
                return reordered;
            });
        }
    };

    return (
        <>
            <DndContext sensors={[sensor]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fileList.map((f) => f.uid)} strategy={verticalListSortingStrategy}>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        multiple
                        beforeUpload={() => false}
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

// Chuyển file thành base64 để xem preview khi ảnh chưa upload thật
const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
