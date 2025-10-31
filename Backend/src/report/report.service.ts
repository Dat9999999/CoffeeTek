import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportQueryDto, TimeUnit } from './dto/report-query.dto';
import { OrderStatus as orderStatus } from 'src/common/enums/orderStatus.enum';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  /**
   * FC-10-01: Báo cáo doanh thu theo thời gian (ngày/tuần/tháng)
   */
  async getRevenueByTime(query: ReportQueryDto){
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
  async getRevenueByCategory(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // Tương tự, phải dùng $queryRaw
    const result = await this.prisma.$queryRaw`
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        SUM(od.quantity * od.unit_price) AS revenue
      FROM "order_details" od
      JOIN "orders" o ON od.order_id = o.id
      JOIN "products" p ON od.product_id = p.id
      JOIN "categories" c ON p.category_id = c.id
      WHERE o.created_at >= ${new Date(startDate)}::timestamp
        AND o.created_at <= ${new Date(endDate)}::timestamp
        AND o.status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC;
    `;
    return result;
  }

  /**
   * FC-10-03: Báo cáo khách hàng mới / quay lại
   */
  async getCustomerSegments(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // 1. Lấy ngày đặt hàng đầu tiên của TẤT CẢ khách hàng
    const allFirstOrders: { customerPhone: string; first_order_date: Date }[] =
      await this.prisma.$queryRaw`
        SELECT "customerPhone", MIN(created_at) AS first_order_date
        FROM "orders"
        WHERE "customerPhone" IS NOT NULL
        GROUP BY "customerPhone";
      `;

    // 2. Lấy danh sách khách hàng đã đặt hàng TRONG KỲ báo cáo
    // BỎ KHAI BÁO KIỂU TƯỜNG MINH (: { customerPhone: string }[]) Ở ĐÂY
    const customersInPeriod = await this.prisma.order.groupBy({
      by: ['customerPhone'],
      where: {
        customerPhone: { not: null }, // Chúng ta đã lọc null ở đây
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Biến customersInPeriod BÂY GIỜ có kiểu là { customerPhone: string | null }[]
    // Chúng ta sử dụng (c.customerPhone as string) để khẳng định kiểu
    const customersInPeriodSet = new Set(
      customersInPeriod.map((c) => c.customerPhone as string), // <-- THÊM 'as string'
    );

    let newCustomers = 0;
    let returningCustomers = 0;

    const start = new Date(startDate).getTime();

    for (const phone of customersInPeriodSet) {
      const firstOrder = allFirstOrders.find((f) => f.customerPhone === phone);

      if (firstOrder) {
        if (firstOrder.first_order_date.getTime() >= start) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      }
    }

    return {
      start_date: startDate,
      end_date: endDate,
      new_customers: newCustomers,
      returning_customers: returningCustomers,
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
        pricePerUnit:true
      },
    });

    const cogs = cogsRecord.reduce((sum, i) => sum + (i.pricePerUnit ?? 0), 0);

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
}