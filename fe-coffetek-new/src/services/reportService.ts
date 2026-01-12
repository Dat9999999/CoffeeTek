// Gợi ý tên file: /services/reportService.ts

import api from "@/lib/api"; // Import Axios instance của bạn

// --- ĐỊNH NGHĨA TYPES (Giả định đã thêm vào) ---
export interface ReportQueryDto {
    startDate: string;
    endDate: string;
    timeUnit?: 'day' | 'week' | 'month';
}

export interface TopNRevenueDto extends ReportQueryDto {
    limit?: number;
}

export interface DashboardStats {
    revenueToday: number;
    revenueYesterday: number;
    costToday: number;
    costYesterday: number;
    profitToday: number;
    profitYesterday: number;
    cancelledOrdersToday: number;
    totalOrdersToday: number;
    totalMembers: number;
    totalActiveProducts: number;
    totalActiveToppings: number;
    outOfStockMaterials: number;
    activePromotionName: string;
    topPaymentMethodToday: string;
}

export interface RevenueBreakdownItem {
    name: string;
    revenue: number;
    percentage: number;
}

export interface RevenueBreakdownResponse {
    totalRevenue: number;
    data: RevenueBreakdownItem[];
}

export type RevenueByDayData = {
    date: string; // "DD-MM-YYYY"
    revenue: number | null;
};

export type RevenueByMonthData = {
    month: string; // "MM-YYYY"
    revenue: number | null;
};

// Kiểu trả về chung cho Top N Bán chạy / Doanh thu theo Sản phẩm
export interface ProductStatData {
    name: string;
    value: number;
}

// Kiểu trả về cho Phân bổ theo Danh mục
export interface CategoryDistributionData {
    name: string;
    count: number;
}

type RevenueReportData = any;
type ProductReportData = ProductStatData[]; // Cập nhật: Dùng ProductStatData[]
type CustomerReportData = any;
type ProfitReportData = any;

// --- SERVICE REPORT CẬP NHẬT ---
export const reportService = {
    // ... Các hàm đã có (getDashboardStats, getRevenueByTime, getRevenueByPaymentMethod, ...)
    async getDashboardStats(): Promise<DashboardStats> {
        const res = await api.get("/reports/dashboard-stats");
        return res.data;
    },

    async getRevenueByTime(params: ReportQueryDto): Promise<RevenueReportData> {
        const res = await api.get("/reports/revenue-by-time", { params });
        return res.data;
    },

    async getRevenueByPaymentMethod(
        params: ReportQueryDto,
    ): Promise<RevenueReportData> {
        const res = await api.get("/reports/revenue-by-payment-method", { params });
        return res.data;
    },

    /**
     * Báo cáo sản phẩm bán chạy (có thể dùng TopNRevenueDto)
     * (Tương ứng: GET /reports/best-selling-products)
     */
    async getBestSellingProducts(
        params: TopNRevenueDto, // Thay ReportQueryDto bằng TopNRevenueDto
    ): Promise<ProductReportData> {
        const res = await api.get("/reports/best-selling-products", { params });
        return res.data;
    },

    /**
     * Báo cáo doanh thu theo sản phẩm (có thể dùng TopNRevenueDto)
     * (Tương ứng: GET /reports/revenue-by-product)
     */
    async getRevenueByProduct(
        params: TopNRevenueDto,
    ): Promise<RevenueBreakdownResponse> { // <--  CẬP NHẬT TYPE
        const res = await api.get("/reports/revenue-by-product", { params });
        return res.data;
    },

    /**
     * Báo cáo doanh thu theo danh mục.
     * (Tương ứng: GET /reports/revenue-by-category)
     */
    async getRevenueByCategory(
        params: ReportQueryDto,
    ): Promise<RevenueBreakdownResponse> { // <-- CẬP NHẬT TYPE
        const res = await api.get("/reports/revenue-by-category", { params });
        return res.data;
    },

    async getCustomerSegments(
        params: ReportQueryDto,
    ): Promise<CustomerReportData> {
        const res = await api.get("/reports/customer-segments", { params });
        return res.data;
    },

    // ... các hàm khác (getCustomerPoints, getProfitReport, getRevenueLastNDays, getRevenueByMonth, getRevenueByYear)
    async getCustomerPoints(): Promise<CustomerReportData> {
        const res = await api.get("/reports/customer-points");
        return res.data;
    },

    async getProfitReport(params: ReportQueryDto): Promise<ProfitReportData> {
        const res = await api.get("/reports/profit-on-material-import", { params });
        return res.data;
    },

    async getRevenueLastNDays(days: number): Promise<RevenueByDayData[]> {
        const res = await api.get("/reports/revenue-last-days", { params: { days } });
        return res.data;
    },

    async getRevenueByMonth(params: {
        month: number;
        year: number;
    }): Promise<RevenueByDayData[]> {
        const res = await api.get("/reports/revenue-by-month", { params });
        return res.data;
    },

    async getRevenueByYear(year: number): Promise<RevenueByMonthData[]> {
        const res = await api.get("/reports/revenue-by-year", { params: { year } });
        return res.data;
    },


    // --- 🔥 CÁC HÀM MỚI BỔ SUNG DỰA TRÊN BACKEND CONTROLLER ---

    /**
     * Biểu đồ Top N sản phẩm bán chạy nhất.
     * (Tương ứng: GET /reports/top-n-best-selling-products)
     */
    async getTopNBestSellingProducts(
        params: TopNRevenueDto,
    ): Promise<ProductStatData[]> { // Giả định trả về ProductStatData[] (name: tên, value: số lượng)
        const res = await api.get("/reports/top-n-best-selling-products", { params });
        return res.data;
    },

    /**
     * Biểu đồ phân bổ sản phẩm theo danh mục.
     * (Tương ứng: GET /reports/product-distribution-by-category)
     */
    async getProductDistributionByCategory(): Promise<CategoryDistributionData[]> {
        const res = await api.get("/reports/product-distribution-by-category");
        return res.data;
    },
};