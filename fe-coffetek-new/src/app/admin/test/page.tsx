"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Typography, message, Form } from "antd";
import { ProductImageUploader, ProductImageState } from "./ProductImageUploader";
import { uploadImages } from "@/services/uploadService";

export default function UpdateProductImagePageTest({ params }: { params: { id: string } }) {
    const productId = params.id || "6";
    const [images, setImages] = useState<ProductImageState[]>([]);
    const [saving, setSaving] = useState(false);

    // ✅ Load ảnh từ server
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`
                );

                const imgs = (res.data.images || []).map((img: any, idx: number) => ({
                    id: img.id,
                    uid: String(img.id),
                    image_name: img.image_name,
                    url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.image_name}`,
                    thumbUrl: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.image_name}`,
                    sort_index: img.sort_index ?? idx + 1,
                    isNew: false,
                    isUpdate: true,

                })) as ProductImageState[];

                setImages(imgs);
            } catch (err) {
                console.error(err);
                message.error("Không thể tải ảnh sản phẩm");
            }
        })();
    }, [productId]);

    // ✅ Khi lưu: upload ảnh mới, bỏ ảnh bị xóa, giữ ảnh cũ (isUpdate)
    const handleSave = async () => {
        setSaving(true);
        try {
            // 1️⃣ Lấy danh sách ảnh mới cần upload
            const newImages = images.filter((img) => img.isNew && img.originFileObj);

            // 2️⃣ Upload ảnh mới (nếu có)
            let uploadedImageNames: string[] = [];
            if (newImages.length > 0) {
                const files = newImages.map((img) => img.originFileObj!) as File[];
                uploadedImageNames = await uploadImages(files);
                if (uploadedImageNames.length !== newImages.length) {
                    throw new Error("Upload ảnh thất bại (số lượng ảnh không khớp)");
                }
            }

            // 3️⃣ Ánh xạ lại image_name cho các ảnh mới sau khi upload
            const updatedImages = images.map((img) => {
                if (img.isNew && img.originFileObj) {
                    const index = newImages.findIndex((n) => n.uid === img.uid);
                    return {
                        ...img,
                        image_name: uploadedImageNames[index],
                        isNew: false,
                        isUpdate: true,
                    };
                }
                return img;
            });

            // 4️⃣ Tạo payload cuối cùng (thứ tự + tên file)
            const payloadImages = updatedImages.map((img, idx) => ({
                image_name: img.image_name,
                sort_index: idx + 1,
            }));

            console.log(">>> payloadImages:", payloadImages);

            // 5️⃣ Gửi payload cập nhật sản phẩm
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`, {
                images: payloadImages,
            });

            setImages(updatedImages);
            message.success("Cập nhật ảnh thành công!");
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lưu ảnh");
        } finally {
            setSaving(false);
        }
    };

    return (


        <>
            <div style={{ marginTop: 12 }}>
                <ProductImageUploader
                    value={images}
                    onChange={(imgs: ProductImageState[]) => setImages(imgs)}
                />
            </div>



            {/* <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <Button type="primary" onClick={handleSave} loading={saving}>
                    Lưu
                </Button>
            </div> */}
        </>

    );
}
