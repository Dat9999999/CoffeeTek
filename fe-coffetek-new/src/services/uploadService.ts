// services/uploadService.ts
import axios from "axios";

export const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/images`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return res.data;
    } catch (err) {
        console.error("Upload failed", err);
        throw err;
    }
};
