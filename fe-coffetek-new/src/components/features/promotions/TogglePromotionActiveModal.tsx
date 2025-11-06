"use client";

import { Modal, message } from "antd";
import dayjs from "dayjs";
import { promotionService } from "@/services/promotionService";
import type { Promotion } from "@/interfaces";

interface Props {
    open: boolean;
    record: Promotion | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TogglePromotionActiveModal({
    open,
    record,
    onClose,
    onSuccess,
}: Props) {
    if (!record) return null;

    const isCurrentlyActive = record.is_active;
    const now = dayjs();
    const withinRange =
        record.start_date && record.end_date
            ? now.isAfter(dayjs(record.start_date)) && now.isBefore(dayjs(record.end_date))
            : false;

    const handleToggle = async () => {
        try {
            if (!isCurrentlyActive && !withinRange) {
                message.warning(
                    "You can only activate a promotion whose current date is within its valid period."
                );
                onClose();
                return;
            }

            await promotionService.toggleActive(record.id, !isCurrentlyActive);
            message.success(
                `Promotion has been ${!isCurrentlyActive ? "activated" : "deactivated"} successfully.`
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Failed to toggle promotion state.");
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleToggle}
            okText={isCurrentlyActive ? "Deactivate" : "Activate"}
            okButtonProps={{ danger: isCurrentlyActive }}
            centered
            title={`${isCurrentlyActive ? "Deactivate" : "Activate"} Promotion`}
        >
            <p>
                Are you sure you want to{" "}
                <strong>{isCurrentlyActive ? "deactivate" : "activate"}</strong> this promotion?
            </p>

            {!isCurrentlyActive && !withinRange && (
                <p style={{ color: "red" }}>
                    This promotion cannot be activated because it is outside its valid period.
                </p>
            )}
        </Modal>
    );
}
