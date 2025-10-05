'use client';

import { useState } from "react";
import { Modal, Form, Input, InputNumber, message, Upload, Button, Image, Row, Col } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import type { Topping } from "@/interfaces";
import { formatPrice, parsePrice, restrictInputToNumbers } from '@/utils/priceFormatter';
import { uploadImages, toppingService } from "@/services";
import type { UploadFile, UploadProps } from 'antd';

interface CreateToppingModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newTopping: Topping) => void;
}

export function CreateToppingModal({ open, onClose, onSuccess }: CreateToppingModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const limitedFileList = newFileList.slice(-1);
        setFileList(limitedFileList);

        if (limitedFileList.length > 0 && limitedFileList[0].originFileObj) {
            const url = URL.createObjectURL(limitedFileList[0].originFileObj as File);
            setPreviewImage(url);
        } else {
            setPreviewImage(null);
        }

        form.setFieldsValue({ image_name: limitedFileList.length > 0 ? limitedFileList : undefined });
    };

    const handlePreviewCancel = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let imageUrl = '';
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const uploadedFiles = await uploadImages([fileList[0].originFileObj as File]);
                imageUrl = uploadedFiles[0];
            }

            const payload = { ...values, image_name: imageUrl };
            const res = await toppingService.create(payload);

            message.success("Topping created successfully!");
            onSuccess(res);
            form.resetFields();
            setFileList([]);
            setPreviewImage(null);
            onClose();
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
        <Modal
            title="Create Topping"
            open={open}
            onCancel={() => {
                onClose();
                handlePreviewCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Create"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setFileList([]);
                    handlePreviewCancel();
                }
            }}
        >
            <Form form={form} layout="vertical" initialValues={{ price: 0 }}>
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
                        style={{ width: '100%' }}
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
                        listType="picture"
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
                            style={{ maxWidth: '100%', maxHeight: 200 }}
                            preview={{
                                onVisibleChange: (visible) => {
                                    if (!visible) handlePreviewCancel();
                                },
                            }}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}
