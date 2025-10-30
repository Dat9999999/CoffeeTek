import { OrderStatus } from "@/interfaces";

export const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
        case OrderStatus.PENDING:
            return "gold";
        case OrderStatus.PAID:
            return "green";
        case OrderStatus.COMPLETED:
            return "geekblue";
        case OrderStatus.CANCELED:
            return "red";
        default:
            return "default";
    }
};
