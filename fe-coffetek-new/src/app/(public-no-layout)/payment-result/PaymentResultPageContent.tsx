"use client";

import React, { useEffect, useState } from "react";
import { Result, Descriptions, Button, Spin } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    HomeOutlined,
    WarningOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import { formatPrice } from "@/utils"

interface PaymentData {
    status: string | null;
    orderInfo: string;
    paymentTime: string | null;
    transactionId: string | null;
    totalPrice: string | null;
    transactionStatus: string | null;
    orderId?: number | null;
}

const PaymentResultPageContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [isKiosk, setIsKiosk] = useState<boolean>(false);

    useEffect(() => {
        if (!searchParams) return;

        const orderInfo = decodeURIComponent(searchParams.get("vnp_OrderInfo") || "");
        // Extract order ID from orderInfo: "Thanh toan don hang {orderId}"
        const orderIdMatch = orderInfo.match(/(\d+)/);
        const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;

        const data: PaymentData = {
            status: searchParams.get("vnp_TransactionStatus"),
            orderInfo: orderInfo,
            paymentTime: searchParams.get("vnp_PayDate"),
            transactionId: searchParams.get("vnp_TransactionNo"),
            totalPrice: searchParams.get("vnp_Amount"),
            transactionStatus: searchParams.get("vnp_TransactionStatus"),
            orderId: orderId,
        };

        // Format data
        if (data.paymentTime) {
            data.paymentTime = dayjs(data.paymentTime, "YYYYMMDDHHmmss").format(
                "DD/MM/YYYY HH:mm:ss"
            );
        }
        if (data.totalPrice) {
            data.totalPrice = formatPrice(parseInt(data.totalPrice) / 100, { includeSymbol: true })
        }

        // Detect if payment is from Kiosk (check localStorage)
        const hasKioskCart = typeof window !== 'undefined' && localStorage.getItem('kiosk_cart');
        const hasKioskPhone = typeof window !== 'undefined' && localStorage.getItem('kiosk_phone');
        setIsKiosk(!!(hasKioskCart || hasKioskPhone));

        setPaymentData(data);
        console.log("total price: ", data.totalPrice)
    }, [searchParams]);

    if (!paymentData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin tip="Loading payment result..." size="large" />
            </div>
        );
    }

    const isSuccess = paymentData.status === "00";
    const isCancelled = paymentData.status === "99";

    let resultStatus: "success" | "warning" | "error" = "error";
    let resultIcon = <CloseCircleOutlined />;
    let resultTitle = "Payment failed!";
    let resultSubTitle =
        "Your transaction could not be completed. Please check again or contact support.";
    let transactionStatusText = "Failed";

    if (isSuccess) {
        resultStatus = "success";
        resultIcon = <CheckCircleOutlined />;
        resultTitle = "Payment successful!";
        resultSubTitle =
            "Your transaction has been successfully processed. Thank you for your purchase.";
        transactionStatusText = "Successful";
        
        // Clear Kiosk cart if payment successful from Kiosk
        if (isKiosk && typeof window !== 'undefined') {
            localStorage.removeItem('kiosk_cart');
        }
    } else if (isCancelled) {
        resultStatus = "warning";
        resultIcon = <WarningOutlined />;
        resultTitle = "Transaction cancelled!";
        resultSubTitle =
            "Your transaction has been cancelled.The payment bank is under maintenance. Please try again or contact support if needed.";
        transactionStatusText = "Cancelled";
    }

    // Determine redirect buttons based on context
    const getActionButtons = () => {
        const buttons = [];
        
        if (isSuccess) {
            if (isKiosk) {
                buttons.push(
                    <Link href="/kiosk" key="kiosk">
                        <Button type="primary" icon={<HomeOutlined />} size="large">
                            Back to Kiosk Menu
                        </Button>
                    </Link>
                );
            } else {
                buttons.push(
                    <Link href="/pos/orders-processing" key="pos">
                        <Button type="primary" icon={<ShoppingOutlined />} size="large">
                            Back to POS Orders
                        </Button>
                    </Link>
                );
            }
        }
        
        buttons.push(
            <Link href="/" key="home">
                <Button icon={<HomeOutlined />} size="large">
                    Back to Home Page
                </Button>
            </Link>
        );
        
        return buttons;
    };

    return (
        <div className="max-w-3xl mx-auto min-h-screen bg-white p-6 shadow-md rounded-lg">
            <Result
                status={resultStatus}
                icon={resultIcon}
                title={resultTitle}
                subTitle={resultSubTitle}
                extra={getActionButtons()}
            />

            <Descriptions
                title="Transaction Details"
                bordered
                column={1}
                className="mt-6"
            >
                <Descriptions.Item label="Status">
                    {transactionStatusText}
                </Descriptions.Item>
                {paymentData.orderId && (
                    <Descriptions.Item label="Order ID">
                        #{paymentData.orderId}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Transaction Information">
                    {paymentData.orderInfo || "No information available"}
                </Descriptions.Item>
                <Descriptions.Item label="VNPAY Transaction ID">
                    {paymentData.transactionId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                    {paymentData.totalPrice || "0 đ"}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Time">
                    {paymentData.paymentTime || "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default PaymentResultPageContent;
