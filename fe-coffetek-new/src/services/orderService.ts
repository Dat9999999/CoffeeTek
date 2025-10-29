import api from "@/lib/api"; // Using axios for API calls

// Define ToppingItem interface
interface ToppingItem {
    toppingId: string;
    quantity: string;
}

// Define OrderItem interface
interface OrderItem {
    productId: string;
    quantity: string;
    toppingItems?: ToppingItem[];
    sizeId?: string | null;
    optionId?: string[]; //option value id
}

// Define CreateOrder interface based on CreateOrderDto
interface CreateOrder {
    order_details: OrderItem[];
    customerPhone?: string;
    staffId: string;
    note?: string;
}

// Define UpdateOrder interface based on UpdateOrderDto (partial fields)
interface UpdateOrder {
    order_details?: OrderItem[];
    customerPhone?: string;
    staffId?: string;
    note?: string;
}

// Define Payment interface based on PaymentDTO
interface Payment {
    orderId: number;
    amount?: number;
    voucherCode?: string;
    change?: number;
}

// Define UpdateStatus interface based on UpdateOrderStatusDTO
interface UpdateStatus {
    orderId: number;
    status: string;
}

export const orderService = {
    async getAll(params?: {
        page?: number;
        size?: number;
        searchName?: string;
        searchStatus?: string;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }) {
        const res = await api.get("/order", { params });
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/order/${id}`);
        return res.data;
    },

    async create(data: CreateOrder) {
        const res = await api.post("/order", data);
        return res.data;
    },

    async update(id: number, data: UpdateOrder) {
        const res = await api.patch(`/order/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        const res = await api.delete(`/order/${id}`);
        return res.data;
    },

    async updateStatus(data: UpdateStatus) {
        const res = await api.patch("/order/status", data);
        return res.data;
    },

    async payByCash(data: Payment) {
        const res = await api.patch("/order/paid/cash", data);
        return res.data;
    },

    async payOnline(data: Payment) {
        const res = await api.post("/order/paid/online", data);
        return res.data;
    },

    async updateItems(id: number, data: UpdateOrder) {
        const res = await api.put(`/order/${id}`, data);
        return res.data;
    },

    async getInvoice(orderId: number) {
        const res = await api.get(`/order/invoice/${orderId}`);
        return res.data;
    },
};