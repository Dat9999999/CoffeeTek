'use client';
import React, { useState, useEffect } from "react";
import { Upload, Image, message, Alert, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
const { Text, Link } = Typography;
import {
    DndContext,
    PointerSensor,
    useSensor,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { DraggableUploadListItem } from "./DraggableUploadListItem";
import styles from "@/styles/ProductImageUploader.module.css";

export interface ProductImageState extends UploadFile {
    id?: number;  // ID ảnh đã tồn tại trong DB
    image_name?: string;
    isNew?: boolean;     // true nếu ảnh mới upload (chưa có trong DB)
    isUpdate?: boolean;  // true nếu ảnh thuộc update (ảnh cũ)
    sort_index?: number; // Thứ tự hiển thị
}

interface ProductImageUploaderProps {
    value?: ProductImageState[];
    onChange?: (files: ProductImageState[]) => void;
    maxCount?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
    value = [],
    onChange,
    maxCount = 10,
}) => {
    const [fileList, setFileList] = useState<ProductImageState[]>(value);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const sensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
    });

    useEffect(() => {
        setFileList(value);
    }, [value]);

    // Khi thay đổi danh sách ảnh (thêm, xóa, upload mới)
    const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
        const limited = newList.slice(-maxCount);

        const withMeta = limited.map((f, i) => ({
            ...f,
            sort_index: i,
            // Nếu ảnh mới (chưa có url DB) => isNew, còn lại là isUpdate
            isNew: !f.url,
            isUpdate: !!f.url,
        })) as ProductImageState[];

        setFileList(withMeta);
        onChange?.(withMeta);
    };

    const handlePreview = async (file: ProductImageState) => {
        if (!file.url && !file.preview && file.originFileObj) {
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

    const handleRemove = (file: ProductImageState) => {
        // Xóa khỏi state (không cần đánh dấu gì)
        const filtered = fileList.filter((f) => f.uid !== file.uid);
        setFileList(filtered);
        onChange?.(filtered);
    };

    return (
        <>
            <DndContext sensors={[sensor]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fileList.map((f) => f.uid)} strategy={rectSortingStrategy}>
                    <div className={styles.imageWrapper}>
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
                            onRemove={handleRemove}
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
                    </div>
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
                        afterOpenChange: (visible) => !visible && setPreviewImage(""),
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
