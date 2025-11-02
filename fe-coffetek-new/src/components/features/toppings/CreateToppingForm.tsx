"use client";

import { useState } from "react";
import {
    Form,
    Input,
    InputNumber,
    message,
    Upload,
    Button,
    Image,
    Card,
    Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { Topping } from "@/interfaces";
import { formatPrice, parsePrice, restrictInputToNumbers } from "@/utils/priceFormatter";
import { uploadImages, toppingService } from "@/services";
import type { UploadFile, UploadProps } from "antd";

interface CreateToppingFormProps {
    onSuccess?: (newTopping: Topping) => void;
}

export function CreateToppingForm({ onSuccess }: CreateToppingFormProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    /** Xử lý upload ảnh */
    const handleUploadChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
        const limitedFileList = newFileList.slice(-1); // chỉ 1 file
        setFileList(limitedFileList);

        if (limitedFileList.length > 0 && limitedFileList[0].originFileObj) {
            const url = URL.createObjectURL(limitedFileList[0].originFileObj as File);
            setPreviewImage(url);
        } else {
            setPreviewImage(null);
        }

        form.setFieldsValue({
            image_name: limitedFileList.length > 0 ? limitedFileList : undefined,
        });
    };

    const handlePreviewCancel = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
    };

    /** Gửi form */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let imageUrl = "";
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const uploadedFiles = await uploadImages([fileList[0].originFileObj as File]);
                imageUrl = uploadedFiles[0];
            }

            const payload = { ...values, image_name: imageUrl };
            const res = await toppingService.create(payload);

            message.success("Topping created successfully!");
            onSuccess?.(res);

            // Reset lại form
            form.resetFields();
            setFileList([]);
            handlePreviewCancel();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Topping name already exists!");
            } else if (!err.errorFields) {
                message.error("An error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{ maxWidth: 600, margin: "0 auto" }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ price: 0 }}
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter the topping name!" }]}
                >
                    <Input placeholder="Enter topping name" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[
                        { required: true, message: "Please enter the price!" },
                        { type: "number", min: 0, message: "Price must be >= 0" },
                    ]}
                >
                    <InputNumber<number>
                        min={0}
                        style={{ width: "100%" }}
                        formatter={(value) => formatPrice(value, { includeSymbol: false })}
                        parser={(value) => parsePrice(value)}
                        onKeyDown={(e) => restrictInputToNumbers(e)}
                    />
                </Form.Item>

                <Form.Item
                    name="image_name"
                    label="Upload Image"
                    rules={[
                        {
                            validator: () =>
                                fileList.length > 0
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Please upload an image!")),
                        },
                    ]}
                >
                    <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        listType="text"
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </Form.Item>

                {previewImage && (
                    <Form.Item label="Image Preview">
                        <Image
                            src={previewImage}
                            alt="Image Preview"
                            width={120}
                            height={120}
                            style={{
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #eee",
                            }}
                            preview={false}
                        />
                    </Form.Item>
                )}

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create
                        </Button>
                        <Button
                            htmlType="button"
                            onClick={() => {
                                form.resetFields();
                                setFileList([]);
                                handlePreviewCancel();
                            }}
                        >
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}
