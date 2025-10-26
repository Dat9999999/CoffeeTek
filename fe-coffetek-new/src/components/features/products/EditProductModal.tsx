'use client';
import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message, Upload, Button, Switch, Row, Col, Space } from "antd";
import { PlusOutlined, UploadOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type { Product } from "@/interfaces";
import { formatPrice, parsePrice, restrictInputToNumbers } from "@/utils/priceFormatter";
import { uploadImages } from "@/services";
import { productService } from "@/services/productService";
import type { UploadFile } from 'antd';

interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    record?: Product | null;
    onSuccess: () => void;
}

export function EditProductModal({ open, onClose, record, onSuccess }: EditProductModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isMultiSize, setIsMultiSize] = useState(false);

    useEffect(() => {
        if (open && record) {
            form.setFieldsValue({
                name: record.name,
                is_multi_size: record.is_multi_size,
                price: record.price,
                product_detail: record.product_detail,
                categoryId: record.category_id ?? undefined,
                sizeIds: record.sizes?.map(s => ({ size_id: s.size_id, price: s.price })) ?? undefined,
            });
            setIsMultiSize(!!record.is_multi_size);
            // set fileList from existing images
            if (record.images && record.images.length > 0) {
                const files = record.images.map(img => ({
                    uid: `-img-${img.id}`,
                    name: img.image_name,
                    status: 'done' as const,
                    url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.image_name}`,
                } as UploadFile));
                setFileList(files);
                setPreviewUrls(files.map(f => f.url || ''));
            } else {
                setFileList([]);
                setPreviewUrls([]);
            }
        } else if (!open) {
            form.resetFields();
            setFileList([]);
            setPreviewUrls([]);
            setIsMultiSize(false);
        }
    }, [open, record]);

    const handleUploadChange = ({ fileList: newList }: { fileList: UploadFile[] }) => {
        const limited = newList.slice(0, 5);
        setFileList(limited);
        const urls = limited.map(f => f.originFileObj ? URL.createObjectURL(f.originFileObj as File) : (f.url || ''));
        setPreviewUrls(urls);
        form.setFieldsValue({ images: limited.length > 0 ? limited : undefined });
    };

    const handlePreviewCancel = () => {
        previewUrls.forEach(u => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
        setPreviewUrls([]);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!record) return;
            setLoading(true);

            // Upload new files only (files with originFileObj)
            const originFiles = fileList.map(f => f.originFileObj as File).filter(Boolean);
            let uploadedUrls: string[] = [];
            if (originFiles.length > 0) {
                uploadedUrls = await uploadImages(originFiles);
            }

            // Build images payload — combine existing (done with url but no origin) and new uploaded ones
            const existingUrlsFromList = fileList
                .filter(f => !f.originFileObj && f.url)
                .map(f => {
                    // f.name is image_name in our convention
                    return (f.name as string);
                });

            const finalImageNames: string[] = [
                ...existingUrlsFromList,
                ...uploadedUrls
            ];

            const imagesPayload = finalImageNames.map((imgName, idx) => ({ image_name: imgName, sort_index: idx + 1 }));

            const payload = {
                name: values.name,
                is_multi_size: values.is_multi_size,
                product_detail: values.product_detail,
                categoryId: values.categoryId ?? null,
                price: values.is_multi_size ? undefined : values.price,
                sizeIds: values.sizeIds ? values.sizeIds.map((s: any) => ({ id: Number(s.size_id), price: Number(s.price) })) : undefined,
                images: imagesPayload.length > 0 ? imagesPayload : undefined,
            };

            await productService.update(record.id, payload);
            message.success("Product updated successfully!");
            onSuccess();
            form.resetFields();
            setFileList([]);
            handlePreviewCancel();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Conflict");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Product"
            open={open}
            onCancel={() => {
                onClose();
                handlePreviewCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update"
            afterOpenChange={(visible) => {
                if (!visible) {
                    form.resetFields();
                    setFileList([]);
                    setPreviewUrls([]);
                }
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter product name" }]}>
                    <Input placeholder="Product name" />
                </Form.Item>

                <Form.Item name="is_multi_size" label="Is Multi Size" valuePropName="checked">
                    <Switch onChange={(v) => setIsMultiSize(v)} />
                </Form.Item>

                {!isMultiSize && (
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: "Please enter price" }, { type: "number", min: 0, message: "Price must be >= 0" }]}
                    >
                        <InputNumber<number>
                            min={0}
                            style={{ width: '100%' }}
                            formatter={(value) => formatPrice(value, { includeSymbol: false })}
                            parser={(value) => parsePrice(value)}
                            onKeyDown={(e) => restrictInputToNumbers(e)}
                        />
                    </Form.Item>
                )}

                {isMultiSize && (
                    <Form.List name="sizeIds">
                        {(fields, { add, remove }) => (
                            <>
                                <label>Sizes</label>
                                {fields.map((field) => (
                                    <Row gutter={8} key={field.key} align="middle" style={{ marginBottom: 8 }}>
                                        <Col flex="120px">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'size_id']}
                                                rules={[{ required: true, message: 'Size id required' }]}
                                            >
                                                <Input placeholder="Size id (number)" />
                                            </Form.Item>
                                        </Col>
                                        <Col flex="auto">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'price']}
                                                rules={[{ required: true, message: 'Price required' }]}
                                            >
                                                <InputNumber<number>
                                                    min={0}
                                                    style={{ width: '100%' }}
                                                    formatter={(value) => formatPrice(value, { includeSymbol: false })}
                                                    parser={(value) => parsePrice(value)}
                                                    onKeyDown={(e) => restrictInputToNumbers(e)}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col>
                                            <MinusCircleOutlined onClick={() => remove(field.name)} />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                                        Add size
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                )}

                <Form.Item name="categoryId" label="Category ID (optional)">
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="product_detail" label="Description">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="images" label="Images">
                    <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        listType="picture"
                        multiple
                        maxCount={5}
                        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    >
                        <Button icon={<UploadOutlined />}>Select Images (max 5)</Button>
                    </Upload>
                </Form.Item>

                <Space direction="vertical" style={{ width: '100%' }}>
                    {previewUrls.length > 0 &&
                        previewUrls.map((u, i) => (
                            <div key={i}>
                                <img src={u} alt={`preview-${i}`} style={{ width: 120, height: 80, objectFit: 'cover' }} />
                            </div>
                        ))}
                </Space>
            </Form>
        </Modal>
    );
}
