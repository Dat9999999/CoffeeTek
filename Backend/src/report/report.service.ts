import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportQueryDto, TimeUnit } from './dto/report-query.dto';
import { OrderStatus, OrderStatus as orderStatus } from 'src/common/enums/orderStatus.enum';
import { RevenueByMonthDto } from './dto/revenue-by-month.dto';
import { RevenueByYearDto } from './dto/RevenueByYearDto';
import { TopNRevenueDto } from './dto/TopNRevenueDto';
import { Prisma } from '@prisma/client';

interface CategoryRevenue {
  id: number | string;
  name: string;
  revenue: number;
  percentage: number;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  /**
   * FC-10-01: Báo cáo doanh thu theo thời gian (ngày/tuần/tháng)
   */
  async getRevenueByTime(query: ReportQueryDto) {
    const { startDate, endDate, timeUnit } = query;

    // Sử dụng $queryRawUnsafe để TRUNCATE date, cẩn thận với timeUnit
    // Đảm bảo timeUnit là một trong các giá trị 'day', 'week', 'month'
    const validTimeUnit = Object.values(TimeUnit).includes(timeUnit)
      ? timeUnit
      : TimeUnit.DAY;

    const result = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${validTimeUnit}, payment_time) AS period,
        SUM(amount) AS total_revenue
      FROM "payment_details"
      WHERE payment_time >= ${new Date(startDate)}::timestamp
        AND payment_time <= ${new Date(endDate)}::timestamp
        AND status = ${orderStatus.COMPLETED}
      GROUP BY period
      ORDER BY period ASC;
    `;

    return result;
  }

  /**
   * FC-10-01: Báo cáo doanh thu theo phương thức thanh toán
   */
  async getRevenueByPaymentMethod(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    const results = await this.prisma.paymentDetail.groupBy({
      by: ['payment_method_id'],
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
        payment_time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Lấy tên của các phương thức thanh toán
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: {
        id: {
          in: results.map((r) => r.payment_method_id),
        },
      },
    });

    return results.map((r) => ({
      payment_method_name:
        paymentMethods.find((pm) => pm.id === r.payment_method_id)?.name ||
        'Unknown',
      total_revenue: r._sum.amount,
    }));
  }

  /**
   * FC-10-02: Báo cáo sản phẩm bán chạy (Top 10)
   */
  async getBestSellingProducts(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    return await this.prisma.orderDetail.groupBy({
      by: ['product_id', 'product_name'],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          created_at: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          status: {
            not: 'cancelled', // Không tính đơn đã hủy
          },
        },
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo sản phẩm
   * Phải dùng $queryRaw vì Prisma groupBy không hỗ trợ tính toán (SUM(A*B))
   */
  async getRevenueByProduct(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // 1. Doanh thu từ sản phẩm chính (OrderDetail)
    const productRevenue = await this.prisma.$queryRaw`
      SELECT
        od.product_id,
        od.product_name,
        SUM(od.quantity * od.unit_price) AS revenue
      FROM "order_details" od
      JOIN "orders" o ON od.order_id = o.id
      WHERE o.created_at >= ${new Date(startDate)}::timestamp
        AND o.created_at <= ${new Date(endDate)}::timestamp
        AND o.status != 'cancelled'
      GROUP BY od.product_id, od.product_name;
    `;

    // 2. Doanh thu từ topping (ToppingOrderDetail)
    // Topping cũng là một 'Product', nên ta gộp chung vào
    const toppingRevenue = await this.prisma.$queryRaw`
      SELECT
        tod.topping_id AS product_id,
        p.name AS product_name,
        SUM(tod.quantity * tod.unit_price) AS revenue
      FROM "topping_order_details" tod
      JOIN "order_details" od ON tod.order_detail_id = od.id
      JOIN "orders" o ON od.order_id = o.id
      JOIN "products" p ON tod.topping_id = p.id
      WHERE o.created_at >= ${new Date(startDate)}::timestamp
        AND o.created_at <= ${new Date(endDate)}::timestamp
        AND o.status != 'cancelled'
      GROUP BY tod.topping_id, p.name;
    `;

    // Gộp 2 kết quả
    const revenueMap = new Map<number, { name: string; revenue: number }>();

    // @ts-ignore
    for (const item of productRevenue) {
      revenueMap.set(item.product_id, {
        name: item.product_name,
        revenue: parseFloat(item.revenue),
      });
    }

    // @ts-ignore
    for (const item of toppingRevenue) {
      const existing = revenueMap.get(item.product_id);
      const revenue = parseFloat(item.revenue);
      if (existing) {
        existing.revenue += revenue;
      } else {
        revenueMap.set(item.product_id, {
          name: item.product_name,
          revenue: revenue,
        });
      }
    }

    return Array.from(revenueMap.entries())
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        total_revenue: data.revenue,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo nhóm sản phẩm (Category)
   */
  // async getRevenueByCategory(query: ReportQueryDto) {
  //   const { startDate, endDate } = query;

  //   // Tương tự, phải dùng $queryRaw
  //   const result = await this.prisma.$queryRaw`
  //     SELECT
  //       c.id AS category_id,
  //       c.name AS category_name,
  //       SUM(od.quantity * od.unit_price) AS revenue
  //     FROM "order_details" od
  //     JOIN "orders" o ON od.order_id = o.id
  //     JOIN "products" p ON od.product_id = p.id
  //     JOIN "categories" c ON p.category_id = c.id
  //     WHERE o.created_at >= ${new Date(startDate)}::timestamp
  //       AND o.created_at <= ${new Date(endDate)}::timestamp
  //       AND o.status != 'cancelled'
  //     GROUP BY c.id, c.name
  //     ORDER BY revenue DESC;
  //   `;
  //   return result;
  // }

  /**
   * FC-10-03: Báo cáo khách hàng mới / quay lại
   */
  async getCustomerSegments(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const orderStatusFilter = {
      in: ['paid', 'completed'], // Giả định đơn hàng đã hoàn thành/thanh toán
    };

    // 1. Lấy danh sách SỐ ĐIỆN THOẠI DUY NHẤT đã mua hàng trong kỳ báo cáo
    const customersInPeriodOrders = await this.prisma.order.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
        status: orderStatusFilter,
        customerPhone: { not: null },
      },
      distinct: ['customerPhone'],
      select: { customerPhone: true },
    });

    const customersInPeriodPhones = customersInPeriodOrders
      .map((o) => o.customerPhone)
      .filter((phone): phone is string => phone !== null);

    const totalCustomers = customersInPeriodPhones.length;

    let newCustomersCount = 0;
    let returningCustomersCount = 0;

    // 2. Lấy thông tin tổng hợp (số lượng đơn hàng và ngày đầu tiên) cho mỗi khách hàng
    const classificationPromises = customersInPeriodPhones.map(phone =>
      this.prisma.order.aggregate({
        where: {
          customerPhone: phone,
          status: orderStatusFilter,
        },
        _count: {
          id: true, // Tổng số đơn hàng trong lịch sử
        },
        _min: {
          created_at: true, // Ngày tạo của đơn hàng đầu tiên (trong lịch sử)
        }
      })
    );

    const customerAggregations = await Promise.all(classificationPromises);

    // 3. Phân loại độc lập
    for (const aggregation of customerAggregations) {
      const firstOrderDate = aggregation._min.created_at;
      const totalOrders = aggregation._count.id;

      if (!firstOrderDate || totalOrders === 0) {
        continue;
      }

      // --- Phân loại Khách hàng mới (Định nghĩa 1) ---
      // Đơn hàng đầu tiên nằm TRONG kỳ báo cáo [start, end]
      if (firstOrderDate.getTime() >= start.getTime() && firstOrderDate.getTime() <= end.getTime()) {
        newCustomersCount++;
      }

      // --- Phân loại Khách hàng quay lại (Định nghĩa 2 - Độc lập) ---
      // Có ít nhất 2 đơn hàng trong lịch sử (và có mua hàng trong kỳ - đã được đảm bảo ở bước 1)
      if (totalOrders >= 2) {
        returningCustomersCount++;
      }
    }

    // 4. Tính toán phần trăm (Phần trăm khách hàng quay lại so với tổng khách hàng trong kỳ)
    // Dựa trên số lượng khách hàng quay lại (returningCustomersCount) đã đếm
    const returningCustomerRate =
      totalCustomers > 0
        ? (returningCustomersCount / totalCustomers) * 100
        : 0;

    return {
      totalCustomers,
      newCustomers: newCustomersCount,
      returningCustomers: returningCustomersCount,
      returningCustomerRate: parseFloat(returningCustomerRate.toFixed(2)),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      // Lưu ý: newCustomers + returningCustomers >= totalCustomers
    };
  }

  /**
   * FC-10-03: Báo cáo điểm thưởng
   * LƯU Ý: Schema của bạn (CustomerPoint) chỉ lưu điểm HIỆN TẠI.
   * Nó không hỗ trợ báo cáo "tổng điểm đã tích lũy" hoặc "đã sử dụng".
   * Do đó, chúng ta chỉ có thể báo cáo số điểm hiện tại của khách hàng.
   */
  async getCustomerPoints() {
    return this.prisma.customerPoint.findMany({
      select: {
        customerPhone: true,
        points: true,
        Customer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        loyalLevel: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
    });
  }

  /**
   * FC-10-02: Báo cáo lợi nhuận (Stub)
   *
   * Việc tính toán lợi nhuận (Doanh thu - COGS) là CỰC KỲ phức tạp.
   * Bạn cần:
   * 1. Lấy tất cả OrderDetail đã bán.
   * 2. Với mỗi OrderDetail, tìm Recipe tương ứng.
   * 3. Với mỗi Recipe, tìm MaterialRecipe (nguyên vật liệu tiêu thụ).
   * 4. Với mỗi Material, tìm chi phí vốn (pricePerUnit từ MaterialImportation).
   * 5. Chi phí vốn có thể tính theo FIFO, LIFO hoặc Trung bình.
   *
   * Đây là một tác vụ nặng, thường được chạy như một batch job (tác vụ nền)
   * chứ không phải là một API call trực tiếp.
   *
   * Do đó, tôi sẽ không triển khai nó ở đây, nhưng bạn đã có Doanh thu (từ
   * getRevenueByProduct), bạn chỉ cần tính COGS (Chi phí vốn) để hoàn thành.
   */
  async getProfitReport(query: ReportQueryDto) {
    // 1. Lấy doanh thu (đã có ở trên) và chuyển sang kiểu rõ ràng
    const revenueRows = (await this.getRevenueByTime(query)) as Array<{
      period?: Date;
      total_revenue?: number | string;
    }>;

    // Tổng doanh thu trong khoảng
    const totalRevenue = revenueRows.reduce(
      (sum, row) => sum + Number(row.total_revenue ?? 0),
      0,
    );

    // 2. Tính COGS (Rất phức tạp) - placeholder: cố gắng lấy một giá trị số nếu tồn tại
    const cogsRecord = await this.prisma.materialImportation.findMany({
      where: {
        importDate: {
          gte: query.startDate,
          lt: query.endDate,
        },
      },
      select: {
        // chọn các trường khả dĩ; dùng cast tiếp nếu schema khác
        pricePerUnit: true,
        importQuantity: true
      },
    });

    const cogs = cogsRecord.reduce((sum, i) => sum + ((i.pricePerUnit ?? 0) * i.importQuantity), 0);

    // 3. Lợi nhuận = Doanh thu - COGS
    const profit = totalRevenue - cogs;

    return {
      start_date: query.startDate,
      end_date: query.endDate,
      total_revenue: totalRevenue,
      cogs,
      profit,
    };
  }

  private getTimeRanges() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { now, startOfToday, endOfToday, startOfYesterday, endOfYesterday };
  }

  async getDashboardStats() {
    const {
      now, startOfToday, endOfToday,
      startOfYesterday, endOfYesterday,
    } = this.getTimeRanges(); // Assuming getTimeRanges() is available

    const paidStatuses = ['paid', 'completed'];

    // The destructuring array must match the $transaction array (10 items)
    const [
      // 1. Today's Revenue
      revenueTodayAgg,
      // 2. Yesterday's Revenue
      revenueYesterdayAgg,
      // 3. Cancelled Orders Today
      cancelledOrdersToday,
      // 4. Total Orders Today
      totalOrdersToday,
      // 5. Total Members
      totalMembers,
      // 6. Total Products (excl. toppings)
      totalActiveProducts,
      // 7. Total Toppings
      totalActiveToppings,
      // 8. Active Promotion
      activePromotionDetail,
      // 9. Out-of-Stock Materials
      outOfStockMaterials,
      // 10. Top Payment Method Today (NEW)
      topPaymentMethodToday,

    ] = await this.prisma.$transaction([
      // 1. Today's Revenue
      this.prisma.order.aggregate({
        _sum: { final_price: true },
        where: {
          status: { in: paidStatuses },
          created_at: { gte: startOfToday, lt: endOfToday },
        },
      }),

      // 2. Yesterday's Revenue
      this.prisma.order.aggregate({
        _sum: { final_price: true },
        where: {
          status: { in: paidStatuses },
          created_at: { gte: startOfYesterday, lt: endOfYesterday },
        },
      }),

      // 3. Cancelled Orders Today
      // Note: Removed redundant queries (e.g., completed, aov)
      this.prisma.order.count({
        where: {
          status: 'cancelled',
          created_at: { gte: startOfToday, lt: endOfToday },
        },
      }),

      // 4. Total Orders Today (all statuses)
      this.prisma.order.count({
        where: { created_at: { gte: startOfToday, lt: endOfToday } },
      }),

      // 5. Total Members (using CustomerPoint for accuracy)
      this.prisma.customerPoint.count(),

      // 6. Total Products
      this.prisma.product.count({
        where: { isActive: true, isTopping: false },
      }),

      // 7. Total Toppings
      this.prisma.product.count({
        where: { isActive: true, isTopping: true },
      }),

      // 8. Active Promotion
      this.prisma.promotion.findFirst({
        where: {
          is_active: true,
          start_date: { lte: now },
          end_date: { gte: now },
        },
        // Select only the name
        select: {
          name: true,
        },
      }),

      // 9. Out-of-Stock Materials
      this.prisma.materialRemain.count({
        where: { remain: { lte: 0 } }, // Zero or negative
      }),

      // 10. ⭐ NEW FIELD: Get today's most used payment method
      this.prisma.paymentMethod.findFirst({
        orderBy: {
          PaymentDetail: {
            _count: 'desc',
          },
        },
        where: {
          is_active: true,
          // Only count payment methods used at least once today
          PaymentDetail: {
            some: {
              payment_time: { gte: startOfToday, lt: endOfToday }
            }
          }
        },
        select: { name: true }
      }),
    ]);

    // Format the return object
    return {
      revenueToday: revenueTodayAgg._sum.final_price || 0,
      revenueYesterday: revenueYesterdayAgg._sum.final_price || 0,
      cancelledOrdersToday: cancelledOrdersToday,
      totalOrdersToday: totalOrdersToday,
      totalMembers: totalMembers,
      totalActiveProducts: totalActiveProducts,
      totalActiveToppings: totalActiveToppings,
      outOfStockMaterials: outOfStockMaterials,

      // Keep the promotion name
      activePromotionName: activePromotionDetail?.name || 'No Promotion', // 'N/A' or 'No Promotion'

      // Today's top payment method
      topPaymentMethodToday: topPaymentMethodToday?.name || 'No Transactions', // 'N/A' or 'No Transactions'
    };
  }


  async getRevenueLastNDays(days: number) {
    // 1. Tính toán ngày bắt đầu và ngày kết thúc
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // 2. Định nghĩa kiểu trả về cho $queryRaw
    type RevenueData = {
      date: Date;
      revenue: number;
    };

    // 3. Truy vấn CSDL (Giữ nguyên query của bạn)
    const revenueData = await this.prisma.$queryRaw<RevenueData[]>`
    SELECT
      DATE_TRUNC('day', "created_at") AS date,
      SUM("final_price")::float AS revenue
    FROM "orders"
    WHERE
      "created_at" >= ${startDate} AND
      "created_at" <= ${endDate} AND
      "status" IN ('completed')
    GROUP BY date
    ORDER BY date ASC;
  `;

    // 4. Xử lý và lấp đầy dữ liệu (Fill missing dates)
    const revenueMap = new Map<string, number>();
    for (const item of revenueData) {
      const dateKey = item.date.toISOString().split('T')[0];
      revenueMap.set(dateKey, item.revenue);
    }

    // 5. Tạo mảng kết quả
    const chartData: { date: string; revenue: number }[] = [];

    const currentDate = new Date(startDate);

    // --- 🔥 BẮT ĐẦU THAY ĐỔI TẠI ĐÂY ---
    while (currentDate <= endDate) {
      // 1. Vẫn dùng key YYYY-MM-DD để tra cứu
      const dateKey = currentDate.toISOString().split('T')[0];
      const revenue = revenueMap.get(dateKey) || 0;

      // 2. Tạo định dạng DD-MM-YYYY để trả về
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 vì getMonth() (0-11)
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // 3. Push định dạng mới vào mảng
      chartData.push({
        date: formattedDate, // <-- Đã đổi thành DD-MM-YYYY
        revenue: revenue,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    // --- 🔥 KẾT THÚC THAY ĐỔI ---

    return chartData;
  }

  async getRevenueByMonth(query: RevenueByMonthDto) {
    const { year, month } = query;

    // 1. Tính toán ngày bắt đầu và kết thúc của tháng
    // Lưu ý: tháng trong JS là 0-indexed (0=Tháng 1, 11=Tháng 12)
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    // Dùng mẹo: lấy ngày 0 của tháng *tiếp theo*
    // Ví dụ: month=11 (T11) -> new Date(2025, 11, 0) = 30/11/2025
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999); // Lấy trọn ngày cuối tháng

    // 2. Định nghĩa kiểu trả về cho $queryRaw
    type RevenueData = {
      date: Date;
      revenue: number;
    };

    // 3. Truy vấn CSDL
    const revenueData = await this.prisma.$queryRaw<RevenueData[]>`
      SELECT
        DATE_TRUNC('day', "created_at") AS date,
        SUM("final_price")::float AS revenue
      FROM "orders"
      WHERE
        "created_at" >= ${startDate} AND
        "created_at" <= ${endDate} AND
        "status" IN ('completed')
      GROUP BY date
      ORDER BY date ASC;
    `;

    // 4. Xử lý và lấp đầy dữ liệu (Fill missing dates)
    const revenueMap = new Map<string, number>();
    for (const item of revenueData) {
      const dateKey = item.date.toISOString().split('T')[0];
      revenueMap.set(dateKey, item.revenue);
    }

    // 5. Tạo mảng kết quả
    const chartData: { date: string; revenue: number }[] = [];
    const currentDate = new Date(startDate); // Bắt đầu lặp từ ngày đầu tiên

    // Lặp cho đến khi currentDate vượt qua endDate
    while (currentDate <= endDate) {
      // Key để tra cứu Map
      const dateKey = currentDate.toISOString().split('T')[0];
      const revenue = revenueMap.get(dateKey) || 0;

      // Format DD-MM-YYYY để trả về
      const day = String(currentDate.getDate()).padStart(2, '0');
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const yearStr = currentDate.getFullYear();
      const formattedDate = `${day}-${monthStr}-${yearStr}`;

      chartData.push({
        date: formattedDate,
        revenue: revenue,
      });

      // Tăng lên 1 ngày
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  }

  async getRevenueByYear(query: RevenueByYearDto) {
    const { year } = query;

    // 1. Tính toán ngày bắt đầu và kết thúc của năm
    const startDate = new Date(year, 0, 1); // Tháng 0 (Tháng 1), ngày 1
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, 11, 31); // Tháng 11 (Tháng 12), ngày 31
    endDate.setHours(23, 59, 59, 999);

    // 2. Định nghĩa kiểu trả về
    // DATE_TRUNC 'month' sẽ trả về ngày đầu tiên của tháng
    type RevenueData = {
      month: Date;
      revenue: number;
    };

    // 3. Truy vấn CSDL, nhóm theo 'month'
    const revenueData = await this.prisma.$queryRaw<RevenueData[]>`
      SELECT
        DATE_TRUNC('month', "created_at") AS month,
        SUM("final_price")::float AS revenue
      FROM "orders"
      WHERE
        "created_at" >= ${startDate} AND
        "created_at" <= ${endDate} AND
        "status" IN ('completed')
      GROUP BY month
      ORDER BY month ASC;
    `;

    // 4. Xử lý và lấp đầy dữ liệu (12 tháng)
    // Tạo Map: {'2025-01-01T00:00:00.000Z': 150000}
    const revenueMap = new Map<string, number>();
    for (const item of revenueData) {
      // Key là ISOTimestamp của ngày đầu tiên của tháng
      revenueMap.set(item.month.toISOString(), item.revenue);
    }

    // 5. Tạo mảng kết quả (luôn 12 tháng)
    const chartData: { month: string; revenue: number }[] = [];

    // Lặp qua 12 tháng (index từ 0 đến 11)
    for (let i = 0; i < 12; i++) {
      // Tạo key (Date object) của ngày đầu tiên của tháng i
      const monthDate = new Date(year, i, 1);
      const monthKey = monthDate.toISOString();

      // Lấy doanh thu, nếu không có thì là 0
      const revenue = revenueMap.get(monthKey) || 0;

      // Format tháng về dạng MM-YYYY (ví dụ: '01-2025')
      const monthStr = String(i + 1).padStart(2, '0');
      const formattedMonth = `${monthStr}-${year}`;

      chartData.push({
        month: formattedMonth,
        revenue: revenue,
      });
    }

    return chartData;
  }


  async getTopNProductRevenue(query: TopNRevenueDto) {
    const { limit, startDate, endDate } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Tính toán doanh thu theo Sản phẩm
    const topProducts: any = await this.prisma.$queryRaw`
            SELECT 
                p.name as name,
                SUM(od.quantity * od.unit_price)::float AS revenue
            FROM "order_details" od
            JOIN "orders" o ON od.order_id = o.id
            JOIN "products" p ON od.product_id = p.id
            WHERE 
                o.status IN ('completed')
                AND o.created_at >= ${start}
                AND o.created_at <= ${end}
            GROUP BY 
                p.id, p.name
            ORDER BY 
                revenue DESC
            LIMIT ${limit};
        `;

    // 2. Tính tổng doanh thu chung (để tính %)
    const totalRevenueResult = await this.prisma.order.aggregate({
      _sum: {
        final_price: true,
      },
      where: {
        status: { in: ['completed'] },
        created_at: { gte: start, lte: end },
      },
    });
    const totalRevenue = totalRevenueResult._sum.final_price || 0;

    // 3. Định dạng kết quả cuối cùng
    return {
      totalRevenue: totalRevenue,
      data: topProducts.map(item => ({
        name: item.name,
        revenue: item.revenue,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      }))
    };
  }

  // Hàm cho API 'revenue-by-category'


  async getRevenueByCategory(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1️⃣ Lấy tất cả order đã thanh toán trong khoảng thời gian
    const orders = await this.prisma.order.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['completed'], // chỉ lấy đơn đã thanh toán hoặc hoàn tất
        },
      },
      include: {
        order_details: {
          include: {
            product: {
              include: {
                category: {
                  include: { parent_category: true },
                },
              },
            },
          },
        },
      },
    });

    // 2️⃣ Gom doanh thu theo category cha
    const categoryRevenue: Record<string, number> = {};
    let uncategorizedRevenue = 0;

    for (const order of orders) {
      for (const detail of order.order_details) {
        const revenue = detail.unit_price * detail.quantity;
        const product = detail.product;

        if (!product || !product.category) {
          // Không có category
          uncategorizedRevenue += revenue;
        } else {
          const category = product.category;
          const parent = category.parent_category;

          // Nếu có parent → doanh thu thuộc parent
          const key = parent ? parent.id.toString() : category.id.toString();

          if (!categoryRevenue[key]) categoryRevenue[key] = 0;
          categoryRevenue[key] += revenue;
        }
      }
    }

    // 3️⃣ Lấy thông tin tên category cha
    const parentCategories = await this.prisma.category.findMany({
      where: { OR: [{ is_parent_category: true }, { parent_category_id: null }] },
      select: { id: true, name: true },
    });

    // 4️⃣ Tính tổng doanh thu
    const totalRevenue =
      Object.values(categoryRevenue).reduce((a, b) => a + b, 0) +
      uncategorizedRevenue;

    // 5️⃣ Chuẩn bị dữ liệu trả về
    const data = parentCategories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        revenue: categoryRevenue[cat.id] || 0,
        percentage:
          totalRevenue > 0
            ? +((categoryRevenue[cat.id] || 0) / totalRevenue * 100).toFixed(2)
            : 0,
      }))
      .filter((x) => x.revenue > 0);

    if (uncategorizedRevenue > 0) {
      data.push({
        id: -1,
        name: 'uncategorized',
        revenue: uncategorizedRevenue,
        percentage:
          totalRevenue > 0
            ? +((uncategorizedRevenue / totalRevenue) * 100).toFixed(2)
            : 0,
      });
    }

    return {
      totalRevenue,
      data,
    };
  }




  /**
   * Get top N best-selling products by quantity sold.
   * Data: SUM(orderDetails.quantity) grouped by product.name, top N.
   * Filters by date range if provided.
   */
  async getTopNBestSellingProducts(query: TopNRevenueDto) {
    const { limit = 10, startDate, endDate } = query;

    const where: Prisma.Sql[] = [Prisma.sql`o.status = 'completed'`];

    if (startDate) {
      where.push(Prisma.sql`o.created_at >= ${new Date(startDate)}`);
    }

    if (endDate) {
      where.push(Prisma.sql`o.created_at <= ${new Date(endDate)}`);
    }

    const whereSql = where.length > 0 ? Prisma.sql`WHERE ${Prisma.join(where, ' AND ')}` : Prisma.empty;

    const sql = Prisma.sql`
      SELECT p.name, SUM(od.quantity)::integer AS "value"
      FROM order_details od
      INNER JOIN orders o ON od.order_id = o.id
      INNER JOIN products p ON od.product_id = p.id
      ${whereSql}
      GROUP BY p.name
      ORDER BY "value" DESC
      LIMIT ${limit}
    `;

    return this.prisma.$queryRaw(sql);
  }

  /**
   * Get product distribution by category.
   * Data: COUNT(products) grouped by category.name.
   */
  async getProductDistributionByCategory() {
    // 1️⃣ Lấy toàn bộ danh mục cha và danh mục con (kèm sản phẩm)
    const categories = await this.prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            products: true,
          },
        },
        products: true,
      },
    });

    // 2️⃣ Lọc ra danh mục cha (is_parent_category = true)
    const parentCategories = categories.filter(c => c.is_parent_category === true);

    // 3️⃣ Tính tổng sản phẩm của danh mục cha + các danh mục con
    const result = parentCategories.map(parent => {
      // Đếm sản phẩm trực tiếp thuộc danh mục cha
      const parentCount = parent.products.length;

      // Đếm sản phẩm của các danh mục con
      const subCount = parent.subcategories.reduce((sum, sub) => sum + sub.products.length, 0);

      return {
        name: parent.name,
        count: parentCount + subCount,
      };
    });

    // 4️⃣ Đếm sản phẩm không có category (Uncategorized)
    const uncategorizedCount = await this.prisma.product.count({
      where: { category_id: null },
    });

    // 5️⃣ Thêm “Uncategorized” vào kết quả
    result.push({
      name: "Uncategorized",
      count: uncategorizedCount,
    });

    return result;
  }







}