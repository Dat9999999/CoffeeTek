"use client";

import { useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { voucherService } from "@/services/voucherService";

interface CreateVoucherModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupName?: string | null;
    voucherName?: string | null;
    discount_percentage?: number | null;
    minAmountOrder?: number | null;
    requirePoint?: number | null;
    valid_from?: string | null;
    valid_to?: string | null;
}

export function CreateVoucherModal({
    open,
    onClose,
    onSuccess,
    groupName = null,
    voucherName = null,
    discount_percentage = null,
    minAmountOrder = null,
    requirePoint = null,
    valid_from = null,
    valid_to = null
}: CreateVoucherModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // ✅ FIX LỖI: Kiểm tra nguồn dữ liệu ngày tháng
            let finalValidFrom, finalValidTo;

            if (values.validPeriod) {
                // Trường hợp 1: Nhập từ DatePicker (Tạo mới hoàn toàn)
                [finalValidFrom, finalValidTo] = values.validPeriod;
            } else {
                // Trường hợp 2: Lấy từ props (Thêm vào Group có sẵn)
                finalValidFrom = valid_from;
                finalValidTo = valid_to;
            }

            // Validate phụ để đảm bảo không bị lỗi logic
            if (!finalValidFrom || !finalValidTo) {
                message.error("Missing validity period info!");
                setLoading(false);
                return;
            }

            const payload: any = {
                ...values,
                validFrom: dayjs(finalValidFrom).toISOString(),
                validTo: dayjs(finalValidTo).toISOString(),
                discountRate: values.discount_percentage,
                voucherName: values.voucher_name,
            };

            // Gán các giá trị mặc định từ props nếu có (để override hoặc bổ sung)
            if (groupName) payload.groupName = groupName;
            if (voucherName) payload.voucherName = voucherName;

            // Nếu props có truyền vào thì ưu tiên dùng props, nếu không dùng values form
            if (discount_percentage !== null && discount_percentage !== undefined) {
                payload.discountRate = discount_percentage;
            }
            if (minAmountOrder !== null && minAmountOrder !== undefined) {
                payload.minAmountOrder = minAmountOrder;
            }
            if (requirePoint !== null && requirePoint !== undefined) {
                payload.requirePoint = requirePoint;
            }

            await voucherService.create(payload);
            message.success("Voucher created successfully!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err?.response?.status === 409) {
                message.error(err.response.data?.message || "Voucher code already exists!");
            } else if (!err.errorFields) {
                message.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={voucherName ? `Generate Voucher: ${voucherName}` : "Generate Voucher"}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Generate"
            afterOpenChange={(visible) => {
                if (!visible) form.resetFields();
            }}
        >
            <Form form={form} layout="vertical">

                {/* Chỉ hiện Voucher Name nếu chưa có prop voucherName */}
                {!voucherName && (
                    <Form.Item
                        name="voucher_name"
                        label="Voucher Name"
                        rules={[{ required: true, message: "Please input voucher name!" }]}
                    >
                        <Input placeholder="Enter voucher name (e.g. Black Friday)" />
                    </Form.Item>
                )}

                <Form.Item
                    name="quantity"
                    label="How many vouchers to generate?"
                    rules={[{ required: true, message: "Please input quantity!" }]}
                >
                    <InputNumber min={1} placeholder="Enter quantity" style={{ width: "100%" }} />
                </Form.Item>

                {/* Chỉ hiện Discount nếu chưa có prop discount_percentage */}
                {!discount_percentage && (
                    <Form.Item
                        name="discount_percentage"
                        label="Discount Percentage (%)"
                        rules={[{ required: true, message: "Please input discount percentage!" }]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            placeholder="Enter discount percentage"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                )}

                {/* Chỉ hiện Min Order nếu chưa có prop minAmountOrder */}
                {!minAmountOrder && (
                    <Form.Item
                        name="minAmountOrder"
                        label="Minimum Order Amount"
                        rules={[{ required: true, message: "Please input minimum order amount!" }]}
                    >
                        <InputNumber min={0} placeholder="Enter minimum order amount" style={{ width: "100%" }} />
                    </Form.Item>
                )}

                {/* Chỉ hiện Point nếu chưa có prop requirePoint */}
                {!requirePoint && (
                    <Form.Item
                        name="requirePoint"
                        label="Required Points"
                        rules={[{ required: true, message: "Please input required points!" }]}
                    >
                        <InputNumber min={0} placeholder="Enter required points" style={{ width: "100%" }} />
                    </Form.Item>
                )}

                {/* Chỉ hiện DatePicker nếu chưa có đủ valid_from và valid_to */}
                {!(valid_from && valid_to) && (
                    <Form.Item
                        name="validPeriod"
                        label="Valid Period"
                        rules={[{ required: true, message: "Please select the valid period!" }]}
                    >
                        <DatePicker.RangePicker
                            style={{ width: "100%" }}
                            format="DD-MM-YYYY"
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}