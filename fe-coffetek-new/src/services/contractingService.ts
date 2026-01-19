import api from "@/lib/api";

export interface Contracting {
    id: number;
    quantity: number;
    materialId: number;
    Material?: {
        id: number;
        name: string;
        code: string;
        unit?: {
            id: number;
            name: string;
            symbol: string;
        };
    };
    empoloyeeId?: number;
    User?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string | Date;
}

export interface CreateContractingDto {
    date: Date | string;
    quantity: number;
    materialId: number;
}

export interface UpdateContractingDto {
    date?: Date | string;
    quantity?: number;
    materialId?: number;
}

export interface GetContractingsByDateDto {
    date?: Date | string;
    page?: number;
    size?: number;
    materialId?: number;
    employeeId?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

export const contractingService = {
    async getAll(params: GetContractingsByDateDto): Promise<PaginatedResponse<Contracting>> {
        // Build query params object
        const queryParams: any = {
            page: params.page || 1,
            size: params.size || 10,
        };
        
        if (params.date) {
            queryParams.date = typeof params.date === 'string' ? params.date : params.date.toISOString();
        }
        
        if (params.materialId) {
            queryParams.materialId = params.materialId;
        }
        
        if (params.employeeId) {
            queryParams.employeeId = params.employeeId;
        }
        
        const res = await api.get("/contracting", { params: queryParams });
        return res.data;
    },

    async getById(id: number): Promise<Contracting> {
        const res = await api.get(`/contracting/${id}`);
        return res.data;
    },

    async create(data: CreateContractingDto): Promise<Contracting> {
        const res = await api.post("/contracting", {
            date: typeof data.date === 'string' ? data.date : data.date.toISOString(),
            quantity: data.quantity,
            materialId: data.materialId,
        });
        return res.data;
    },

    async update(id: number, data: UpdateContractingDto): Promise<Contracting> {
        const res = await api.patch(`/contracting/${id}`, {
            ...(data.date && { date: typeof data.date === 'string' ? data.date : data.date.toISOString() }),
            ...(data.quantity !== undefined && { quantity: data.quantity }),
            ...(data.materialId !== undefined && { materialId: data.materialId }),
        });
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contracting/${id}`);
    },

    async getConsumptionRecords(date: Date | string): Promise<{
        date: string;
        totalRecords: number;
        materials: Array<{
            materialId: number;
            materialName: string;
            materialCode: string;
            unit: string;
            totalConsumed: number;
            recordCount: number;
            orderCount: number;
            orderIds: number[];
            records: Array<{
                id: number;
                consumed: number;
                orderId: number;
                orderDetailId: number | null;
                date: string;
            }>;
        }>;
    }> {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const res = await api.get(`/contracting/consumption-records`, {
            params: { date: dateStr }
        });
        return res.data;
    },

    async resetRemain(date: Date | string): Promise<{
        date: string;
        message: string;
        results: Array<{
            materialId: number;
            materialName: string;
            oldRemain: number | null;
            newRemain: number;
            totalContracted: number;
        }>;
    }> {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const res = await api.post(`/contracting/reset-remain`, null, {
            params: { date: dateStr }
        });
        return res.data;
    },
};

