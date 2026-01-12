import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ReportQueryDto, TimeUnit } from './dto/report-query.dto';
import { OrderStatus } from 'src/common/enums/orderStatus.enum';
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
  private readonly logger = new Logger(ReportsService.name);
  
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) { }

  /**
   * Generate cache key for report queries
   */
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    return `reports:${prefix}:${sortedParams}`;
  }

  /**
   * FC-10-01: Báo cáo doanh thu theo thời gian (ngày/tuần/tháng)
   */
  async getRevenueByTime(query: ReportQueryDto) {
    const { startDate, endDate, timeUnit } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-time', {
      startDate,
      endDate,
      timeUnit: timeUnit || TimeUnit.DAY,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
        AND status = ${OrderStatus.COMPLETED}
      GROUP BY period
      ORDER BY period ASC;
    `;

    // Store in cache (30 minutes TTL for time-based reports)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * FC-10-01: Báo cáo doanh thu theo phương thức thanh toán
   */
  async getRevenueByPaymentMethod(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-payment-method', {
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const results = await this.prisma.paymentDetail.groupBy({
      by: ['payment_method_id'],
      _sum: {
        amount: true,
      },
      where: {
        status: OrderStatus.COMPLETED,
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

    const result = results.map((r) => ({
      payment_method_name:
        paymentMethods.find((pm) => pm.id === r.payment_method_id)?.name ||
        'Unknown',
      total_revenue: r._sum.amount,
    }));

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * FC-10-02: Báo cáo sản phẩm bán chạy (Top 10)
   */
  async getBestSellingProducts(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('best-selling-products', {
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const result = await this.prisma.orderDetail.groupBy({
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
            not: OrderStatus.CANCELED, // Không tính đơn đã hủy
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

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo sản phẩm
   * Phải dùng $queryRaw vì Prisma groupBy không hỗ trợ tính toán (SUM(A*B))
   */
  async getRevenueByProduct(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-product', {
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
        AND o.status != ${OrderStatus.CANCELED}
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
        AND o.status != ${OrderStatus.CANCELED}
      GROUP BY tod.topping_id, p.name;
    `;

    // Gộp 2 kết quả
    const revenueMap = new Map<number, { name: string; revenue: number }>();

    // Type assertion for raw query results
    type RevenueResult = { product_id: number; product_name: string; revenue: string | number };
    
    for (const item of productRevenue as RevenueResult[]) {
      revenueMap.set(item.product_id, {
        name: item.product_name,
        revenue: parseFloat(String(item.revenue)),
      });
    }

    for (const item of toppingRevenue as RevenueResult[]) {
      const existing = revenueMap.get(item.product_id);
      const revenue = parseFloat(String(item.revenue));
      if (existing) {
        existing.revenue += revenue;
      } else {
        revenueMap.set(item.product_id, {
          name: item.product_name,
          revenue: revenue,
        });
      }
    }

    const result = Array.from(revenueMap.entries())
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        total_revenue: data.revenue,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
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

    // Generate cache key
    const cacheKey = this.generateCacheKey('customer-segments', {
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const orderStatusFilter = {
      in: [OrderStatus.PAID, OrderStatus.COMPLETED], // Giả định đơn hàng đã hoàn thành/thanh toán
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

    // 2. ✅ FIX N+1: Lấy thông tin tổng hợp cho TẤT CẢ khách hàng trong một query
    // Sử dụng groupBy để tránh N+1 query problem
    // Note: We get ALL orders for these phones (not just in period) to determine new vs returning
    const customerAggregations = await this.prisma.order.groupBy({
      by: ['customerPhone'],
      where: {
        customerPhone: { in: customersInPeriodPhones },
        status: orderStatusFilter,
        // Don't filter by date here - we need ALL historical orders to determine customer type
      },
      _count: {
        id: true, // Tổng số đơn hàng trong lịch sử (all time)
      },
      _min: {
        created_at: true, // Ngày tạo của đơn hàng đầu tiên (trong lịch sử - all time)
      },
    });

    // 3. Phân loại độc lập
    for (const aggregation of customerAggregations) {
      const firstOrderDate = aggregation._min.created_at;
      const totalOrders = aggregation._count.id;
      const phone = aggregation.customerPhone;

      if (!firstOrderDate || totalOrders === 0 || !phone) {
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

    const result = {
      totalCustomers,
      newCustomers: newCustomersCount,
      returningCustomers: returningCustomersCount,
      returningCustomerRate: parseFloat(returningCustomerRate.toFixed(2)),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      // Lưu ý: newCustomers + returningCustomers >= totalCustomers
    };

    // Store in cache (1 hour TTL - customer segments change less frequently)
    await this.redisService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * FC-10-03: Báo cáo điểm thưởng
   * LƯU Ý: Schema của bạn (CustomerPoint) chỉ lưu điểm HIỆN TẠI.
   * Nó không hỗ trợ báo cáo "tổng điểm đã tích lũy" hoặc "đã sử dụng".
   * Do đó, chúng ta chỉ có thể báo cáo số điểm hiện tại của khách hàng.
   */
  async getCustomerPoints() {
    // Generate cache key (no params for this endpoint)
    const cacheKey = this.generateCacheKey('customer-points', {});

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const result = await this.prisma.customerPoint.findMany({
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

    // Store in cache (15 minutes TTL - points change frequently)
    await this.redisService.set(cacheKey, result, 900);

    return result;
  }

  /**
   * FC-10-02: Báo cáo lợi nhuận
   *
   * ⚠️ WARNING: Current COGS calculation is INCORRECT.
   * It only sums material importation costs, not actual Cost of Goods Sold.
   *
   * To properly calculate COGS, you need to:
   * 1. Get all OrderDetails sold in the period
   * 2. For each OrderDetail, find the Recipe
   * 3. For each Recipe, find MaterialRecipe (materials consumed)
   * 4. For each Material, find cost basis (pricePerUnit from MaterialImportation)
   * 5. Cost basis can be calculated using FIFO, LIFO, or Average
   *
   * This is a heavy task, typically run as a batch job, not a direct API call.
   *
   * Current implementation is a placeholder that calculates:
   * - Revenue: Sum of completed orders
   * - COGS: Sum of material importation costs (INCORRECT - should be based on actual materials used)
   * - Profit: Revenue - COGS
   */
  async getProfitReport(query: ReportQueryDto) {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('profit-report', {
        startDate: query.startDate,
        endDate: query.endDate,
      });

      // Try to get from cache
      const cachedData = await this.redisService.get<any>(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache HIT for: ${cacheKey}`);
        return cachedData;
      }

      this.logger.log(`Cache MISS for: ${cacheKey}`);

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

      // 2. Calculate actual COGS based on materials consumed from recipes
      const cogs = await this.calculateActualCOGS(new Date(query.startDate), new Date(query.endDate));

      // 3. Lợi nhuận = Doanh thu - COGS
      const profit = totalRevenue - cogs;

      const result = {
        start_date: query.startDate,
        end_date: query.endDate,
        total_revenue: totalRevenue,
        cogs,
        profit,
      };

      // Store in cache (30 minutes TTL)
      await this.redisService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      this.logger.error('Error calculating profit report', error);
      throw error;
    }
  }

  /**
   * Calculate actual COGS (Cost of Goods Sold) based on materials consumed from recipes
   * Uses average cost method for materials
   */
  private async calculateActualCOGS(startDate: Date, endDate: Date): Promise<number> {
    // Get all completed orders in the date range
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        created_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        order_details: {
          include: {
            product: {
              include: {
                Recipe: {
                  include: {
                    MaterialRecipe: {
                      include: {
                        Material: {
                          include: {
                            MaterialImportation: true,
                          },
                        },
                        Size: true,
                      },
                    },
                  },
                },
              },
            },
            size: true,
          },
        },
      },
    });

    let totalCOGS = 0;
    const materialPriceCache = new Map<number, number>(); // Cache material average prices

    // Helper function to get material average price
    const getMaterialAveragePrice = (material: any): number => {
      if (materialPriceCache.has(material.id)) {
        return materialPriceCache.get(material.id)!;
      }

      const importations = material.MaterialImportation;
      if (importations.length === 0) {
        materialPriceCache.set(material.id, 0);
        return 0;
      }

      const totalValue = importations.reduce(
        (sum: number, imp: any) => sum + (imp.pricePerUnit * imp.importQuantity),
        0,
      );
      const totalQuantity = importations.reduce(
        (sum: number, imp: any) => sum + imp.importQuantity,
        0,
      );
      const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      materialPriceCache.set(material.id, avgPrice);
      return avgPrice;
    };

    // Calculate COGS for each order
    for (const order of orders) {
      for (const orderDetail of order.order_details) {
        const product = orderDetail.product;
        const quantity = orderDetail.quantity;
        const sizeId = orderDetail.size?.id ?? null;

        // Skip if product has no recipe
        if (!product.Recipe || product.Recipe.length === 0) {
          continue;
        }

        const recipe = product.Recipe[0]; // Assuming one recipe per product
        if (!recipe.MaterialRecipe || recipe.MaterialRecipe.length === 0) {
          continue;
        }

        // Calculate cost for this order detail
        for (const materialRecipe of recipe.MaterialRecipe) {
          // Match size-specific recipes or default (sizeId = null)
          if (
            materialRecipe.sizeId !== null &&
            materialRecipe.sizeId !== sizeId
          ) {
            continue; // Skip if size doesn't match
          }

          const material = materialRecipe.Material;
          const consumePerUnit = materialRecipe.consume;
          const totalConsume = consumePerUnit * quantity;
          const avgPricePerUnit = getMaterialAveragePrice(material);

          // Add to total COGS
          totalCOGS += totalConsume * avgPricePerUnit;
        }
      }
    }

    return Math.round(totalCOGS * 100) / 100; // Round to 2 decimal places
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
    // Generate cache key (dashboard stats are time-sensitive, cache for 5 minutes)
    const cacheKey = this.generateCacheKey('dashboard-stats', {
      timestamp: Math.floor(Date.now() / 300000), // Round to 5-minute intervals
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const {
      now, startOfToday, endOfToday,
      startOfYesterday, endOfYesterday,
    } = this.getTimeRanges(); // Assuming getTimeRanges() is available

    const paidStatuses = [OrderStatus.PAID, OrderStatus.COMPLETED];

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
          status: OrderStatus.CANCELED,
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

    // Calculate COGS separately (not a Prisma query, so can't be in transaction)
    const [costToday, costYesterday] = await Promise.all([
      this.calculateActualCOGS(startOfToday, endOfToday),
      this.calculateActualCOGS(startOfYesterday, endOfYesterday),
    ]);

    // Format the return object
    const result = {
      revenueToday: revenueTodayAgg._sum.final_price || 0,
      revenueYesterday: revenueYesterdayAgg._sum.final_price || 0,
      costToday: costToday || 0,
      costYesterday: costYesterday || 0,
      profitToday: (revenueTodayAgg._sum.final_price || 0) - (costToday || 0),
      profitYesterday: (revenueYesterdayAgg._sum.final_price || 0) - (costYesterday || 0),
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

    // Store in cache (5 minutes TTL - dashboard stats update frequently)
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }


  async getRevenueLastNDays(days: number) {
    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-last-n-days', { days });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
      "status" = ${OrderStatus.COMPLETED}
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

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, chartData, 1800);

    return chartData;
  }

  async getRevenueByMonth(query: RevenueByMonthDto) {
    const { year, month } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-month', { year, month });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
        "status" = ${OrderStatus.COMPLETED}
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

    // Store in cache (1 hour TTL - monthly data changes less frequently)
    await this.redisService.set(cacheKey, chartData, 3600);

    return chartData;
  }

  async getRevenueByYear(query: RevenueByYearDto) {
    const { year } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-year', { year });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
        "status" = ${OrderStatus.COMPLETED}
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

    // Store in cache (2 hours TTL - yearly data changes very infrequently)
    await this.redisService.set(cacheKey, chartData, 7200);

    return chartData;
  }


  async getTopNProductRevenue(query: TopNRevenueDto) {
    const { limit, startDate, endDate } = query;
    
    // Generate cache key
    const cacheKey = this.generateCacheKey('top-n-product-revenue', {
      limit: limit || 10,
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
                o.status = ${OrderStatus.COMPLETED}
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
        status: { in: [OrderStatus.COMPLETED] },
        created_at: { gte: start, lte: end },
      },
    });
    const totalRevenue = totalRevenueResult._sum.final_price || 0;

    // 3. Định dạng kết quả cuối cùng
    const result = {
      totalRevenue: totalRevenue,
      data: topProducts.map(item => ({
        name: item.name,
        revenue: item.revenue,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      }))
    };

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  // Hàm cho API 'revenue-by-category'


  async getRevenueByCategory(query: ReportQueryDto) {
    const { startDate, endDate } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('revenue-by-category', {
      startDate,
      endDate,
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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
          in: [OrderStatus.COMPLETED], // chỉ lấy đơn đã thanh toán hoặc hoàn tất
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

    const result = {
      totalRevenue,
      data,
    };

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }




  /**
   * Get top N best-selling products by quantity sold.
   * Data: SUM(orderDetails.quantity) grouped by product.name, top N.
   * Filters by date range if provided.
   */
  async getTopNBestSellingProducts(query: TopNRevenueDto) {
    const { limit = 10, startDate, endDate } = query;

    // Generate cache key
    const cacheKey = this.generateCacheKey('top-n-best-selling-products', {
      limit,
      startDate: startDate || 'all',
      endDate: endDate || 'all',
    });

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

    const where: Prisma.Sql[] = [Prisma.sql`o.status = ${OrderStatus.COMPLETED}`];

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

    const result = await this.prisma.$queryRaw(sql);

    // Store in cache (30 minutes TTL)
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Get product distribution by category.
   * Data: COUNT(products) grouped by category.name.
   */
  async getProductDistributionByCategory() {
    // Generate cache key (no params for this endpoint)
    const cacheKey = this.generateCacheKey('product-distribution-by-category', {});

    // Try to get from cache
    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Cache MISS for: ${cacheKey}`);

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

    // 5️⃣ Thêm "Uncategorized" vào kết quả
    result.push({
      name: "Uncategorized",
      count: uncategorizedCount,
    });

    // Store in cache (1 hour TTL - product distribution changes infrequently)
    await this.redisService.set(cacheKey, result, 3600);

    return result;
  }







}