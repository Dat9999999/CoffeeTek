'use client';

import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message, Upload, Button, Image, theme } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import type { Topping } from "@/interfaces";
import { formatPrice, parsePrice, restrictInputToNumbers } from "@/utils/priceFormatter";
import { toppingService, uploadImages } from "@/services";
import type { UploadFile } from 'antd';
import { AppImageSize } from "@/components/commons";

interface EditToppingModalProps {
    open: boolean;
    onClose: () => void;
    record?: Topping | null;
    onSuccess: (updatedTopping: Topping) => void;
}

export function EditToppingModal({ open, onClose, record, onSuccess }: EditToppingModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { token } = theme.useToken();

    // Reset form & preview khi modal đóng
    const handlePreviewCancel = () => {
        if (previewImage && fileList[0]?.originFileObj) {
            URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);
    };

    const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        const limitedFileList = newFileList.slice(-1);
        setFileList(limitedFileList);

        if (limitedFileList.length > 0 && limitedFileList[0].originFileObj) {
            const url = URL.createObjectURL(limitedFileList[0].originFileObj as File);
            setPreviewImage(url);
        } else if (limitedFileList[0]?.url) {
            setPreviewImage(limitedFileList[0].url);
        } else {
            setPreviewImage(null);
        }

        form.setFieldsValue({ image_name: limitedFileList.length > 0 ? limitedFileList : undefined });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;

            setLoading(true);

            let imageUrl = record.image_name || '';
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const uploadedFiles = await uploadImages([fileList[0].originFileObj as File]);
                imageUrl = uploadedFiles[0];
            }

            const payload = { ...values, image_name: imageUrl };
            const res = await toppingService.update(record.id, payload);

            message.success("Topping updated successfully!");
            onSuccess(res);
            form.resetFields();
            setFileList([]);
            handlePreviewCancel();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Name already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Topping"
            open={open}
            onCancel={() => {
                onClose();
                handlePreviewCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
            afterOpenChange={(visible) => {
                if (visible && record) {
                    // Gán dữ liệu vào form sau khi modal mở
                    form.setFieldsValue(record);

                    if (record.image_name) {
                        const url = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${record.image_name}`;
                        setPreviewImage(url);
                        setFileList([{
                            uid: '-1',
                            name: record.image_name,
                            status: 'done',
                            url,
                        } as unknown as UploadFile]);
                    } else {
                        setPreviewImage(null);
                        setFileList([]);
                    }
                } else if (!visible) {
                    //  Reset khi modal đóng
                    form.resetFields();
                    setFileList([]);
                    handlePreviewCancel();
                }
            }}
        >
            <Form form={form} layout="vertical">
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
                >
                    <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        listType="text"
                        maxCount={1}
                        showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
                    >
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </Form.Item>

                {previewImage && (
                    <Form.Item label="Image Preview">
                        <AppImageSize
                            srcObj={previewImage}
                            alt="Image Preview"
                            width={120}
                            height={120}
                            style={{
                                objectFit: 'contain',

                            }}

                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}
