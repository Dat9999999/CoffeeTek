"use client";

import React from "react";
import {
    Modal,
    Descriptions,
    Avatar,
    Tag,
    Typography,
    Divider,
    theme,
} from "antd";
import type { User } from "@/interfaces";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface UserDetailModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    open,
    onClose,
    user,
}) => {
    const { token } = theme.useToken();
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

    if (!user) return null;

    const detail = user.detail;
    const avatarSrc = detail?.avatar_url
        ? `${baseUrl}/${detail.avatar_url}`
        : "/default-avatar.png";

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            title={<Title level={4}>User Detail</Title>}
            width={600}
            styles={{
                body: {
                    background: token.colorBgContainer,
                    padding: token.paddingLG,
                },
            }}
        >
            <div style={{ textAlign: "center", marginBottom: token.marginLG }}>
                <Avatar src={avatarSrc} size={100} />
                <Title level={5} style={{ marginTop: token.marginXS }}>
                    {user.first_name} {user.last_name}
                </Title>
                <Tag color={user.is_locked ? "error" : "success"}>
                    {user.is_locked ? "Locked" : "Active"}
                </Tag>
            </div>

            <Divider />

            <Descriptions
                column={1}
                bordered
                labelStyle={{ fontWeight: 600, width: "40%" }}
                contentStyle={{ background: token.colorFillAlter }}
                size="middle"
            >
                <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
                <Descriptions.Item label="Email">
                    {user.email || <Text type="secondary">N/A</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                    {user.phone_number || <Text type="secondary">N/A</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Birthday">
                    {detail?.birthday
                        ? dayjs(detail.birthday).format("DD/MM/YYYY")
                        : <Text type="secondary">N/A</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                    {detail?.sex
                        ? detail.sex.charAt(0).toUpperCase() + detail.sex.slice(1)
                        : <Text type="secondary">N/A</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                    {detail?.address || <Text type="secondary">N/A</Text>}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};
