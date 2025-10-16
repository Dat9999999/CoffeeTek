"use client";

import { useEffect, useState } from "react";
import { Modal, Select, Tag, message, Spin } from "antd";
import type { SelectProps } from "antd";
import type { User } from "@/interfaces";
import { authService } from "@/services";

interface UserRoleModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserRoleModal({ open, user, onClose, onSuccess }: UserRoleModalProps) {
    const [loading, setLoading] = useState(false);
    const [roleOptions, setRoleOptions] = useState<SelectProps["options"]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    useEffect(() => {
        if (!open) return;
        const fetchRoles = async () => {
            setLoading(true);
            try {
                const roles = await authService.getAllRole();

                // ❗ Không cho phép chọn role "owner"
                setRoleOptions(
                    roles.map((r: any) => ({
                        label: r.role_name,
                        value: r.role_name,
                        disabled: r.role_name === "owner",
                    }))
                );

                setSelectedRoles(user?.roles?.map(r => r.role_name) || []);
            } catch (err) {
                message.error("Failed to load roles");
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, [open, user]);

    const handleOk = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const currentRoles = user.roles?.map(r => r.role_name) || [];

            // ❗ Không được phép thêm/bỏ role owner
            const filterOwner = (r: string) => r !== "owner";

            const rolesToAdd = selectedRoles.filter(
                r => !currentRoles.includes(r) && filterOwner(r)
            );
            const rolesToRemove = currentRoles.filter(
                r => !selectedRoles.includes(r) && filterOwner(r)
            );

            for (const role of rolesToAdd) {
                await authService.editRole({ userId: user.id, roleName: role }, true);
            }
            for (const role of rolesToRemove) {
                await authService.editRole({ userId: user.id, roleName: role }, false);
            }

            message.success("Roles updated successfully");
            onSuccess();
            onClose();
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to update roles");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Roles for ${user?.first_name || ""} ${user?.last_name || ""}`}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            okText="Save"
            cancelText="Cancel"
            confirmLoading={loading}
        >
            {loading ? (
                <Spin />
            ) : (
                <Select
                    mode="multiple"
                    style={{ width: "100%", padding: "10px 50px 10px 10px" }}
                    placeholder="Select roles"


                    value={selectedRoles}
                    onChange={(values) => {
                        // Không cho bỏ chọn owner
                        if (selectedRoles.includes("owner") && !values.includes("owner")) {
                            message.warning("You cannot remove 'owner' role.");
                            setSelectedRoles([...values, "owner"]);
                        } else {
                            setSelectedRoles(values);
                        }
                    }}
                    options={roleOptions}
                    tagRender={({ label, value, closable, onClose }) => (
                        <Tag
                            color={value === "owner" ? "red" : "blue"}
                            closable={value !== "owner" && closable}
                            onClose={onClose}
                            style={{ marginInlineEnd: 4 }}
                        >
                            {label}
                        </Tag>
                    )}
                />
            )}
        </Modal>
    );
}
