"use client";

import React, { useEffect, useState } from "react";
import { Result, Descriptions, Button, Spin } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    HomeOutlined,
    WarningOutlined,
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
}

const PaymentResultPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

    useEffect(() => {
        if (!searchParams) return;

        const data: PaymentData = {
            status: searchParams.get("status"),
            orderInfo: decodeURIComponent(searchParams.get("orderInfo") || ""),
            paymentTime: searchParams.get("paymentTime"),
            transactionId: searchParams.get("transactionId"),
            totalPrice: searchParams.get("totalPrice"),
            transactionStatus: searchParams.get("transactionStatus"),
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

    const isSuccess = paymentData.status === "1";
    const isCancelled = paymentData.transactionStatus === "02";

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
    } else if (isCancelled) {
        resultStatus = "warning";
        resultIcon = <WarningOutlined />;
        resultTitle = "Transaction cancelled!";
        resultSubTitle =
            "Your transaction has been cancelled. Please try again or contact support if needed.";
        transactionStatusText = "Cancelled";
    }

    return (
        <div className="max-w-3xl mx-auto min-h-screen bg-white p-6 shadow-md rounded-lg">
            <Result
                status={resultStatus}
                icon={resultIcon}
                title={resultTitle}
                subTitle={resultSubTitle}
                extra={[

                    <Link href={"/"}>
                        <Button icon={<HomeOutlined />} key="home" >
                            Back to Home Page
                        </Button>
                    </Link>,
                ]}
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

export default PaymentResultPage;
