"use client";

import { useState } from "react";
import { Modal, Typography, Button, message, Space } from "antd";
import { userService } from "@/services/userService";
import type { User } from "@/interfaces";

const { Text } = Typography;

interface UserLockModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess?: () => void;
}

export const UserLockModal: React.FC<UserLockModalProps> = ({
    open,
    onClose,
    user,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (user.is_locked) {
                await userService.unlockUser(user.id);
                message.success("User unlocked successfully");
            } else {
                await userService.lockUser(user.id);
                message.success("User locked successfully");
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            message.error("Failed to update user status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={user.is_locked ? "Unlock User" : "Lock User"}
            footer={null}
            centered
        >
            <Space direction="vertical" style={{ width: "100%" }}>
                <Text>
                    {user.is_locked
                        ? `Are you sure you want to unlock "${user.first_name} ${user.last_name}"?`
                        : `Are you sure you want to lock "${user.first_name} ${user.last_name}"?`}
                </Text>

                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type={user.is_locked ? "primary" : "default"}
                        danger={!user.is_locked}
                        loading={loading}
                        onClick={handleConfirm}
                    >
                        {user.is_locked ? "Unlock" : "Lock"}
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
};
