"use client";

import React from "react";
import { Avatar, Typography, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@/interfaces";

const { Text } = Typography;

interface UserOptionItemProps {
    label: string;
    user: User;
}

export const UserOptionItem: React.FC<UserOptionItemProps> = ({ user }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";


    return (
        <Flex
            align="center"
            gap={10}
            style={{
                overflow: "hidden",
                padding: "4px 0",
            }}
        >
            <Avatar
                src={`${baseUrl}/${user.detail?.avatar_url}` || ""}
                icon={<UserOutlined />}
                size={40}
            />
            <div
                style={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Text strong ellipsis>
                    {`${user.first_name} ${user.last_name}`}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.phone_number || "N/A"}
                </Text>

            </div>
        </Flex>
    );
};
