import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './report.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { RevenueLastDaysDto } from './dto/revenue-last-days.dto';
import { RevenueByMonthDto } from './dto/revenue-by-month.dto';
import { RevenueByYearDto } from './dto/RevenueByYearDto';
import { TopNRevenueDto } from './dto/TopNRevenueDto';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  /**
   * FC-10-01: Báo cáo doanh thu theo thời gian (ngày/tuần/tháng)
   */
  @Get('revenue-by-time')
  getRevenueByTime(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getRevenueByTime(query);
  }

  /**
   * FC-10-01: Báo cáo doanh thu theo phương thức thanh toán
   */
  @Get('revenue-by-payment-method')
  getRevenueByPaymentMethod(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getRevenueByPaymentMethod(query);
  }

  /**
   * FC-10-02: Báo cáo sản phẩm bán chạy (Top N Quantity)
    * (Sử dụng TopNRevenueDto để hỗ trợ limit)
   */
  @Get('best-selling-products')
  getBestSellingProducts(@Query(ValidationPipe) query: TopNRevenueDto) {
    // Truyền cả limit, startDate, endDate sang service
    return this.reportsService.getBestSellingProducts(query);
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo sản phẩm (Top N Revenue)
    * API: Tỷ lệ Doanh thu theo Sản phẩm Bán chạy (Top N Products)
   */
  @Get('revenue-by-product')
  getRevenueByProduct(@Query(ValidationPipe) query: TopNRevenueDto) {
    // Truyền cả limit, startDate, endDate sang service
    return this.reportsService.getTopNProductRevenue(query); // Đổi tên hàm service cho rõ ràng hơn
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo nhóm sản phẩm (Category)
    * API: Tỷ lệ Doanh thu theo Danh mục Sản phẩm (Category)
   */
  @Get('revenue-by-category')
  getRevenueByCategory(@Query(ValidationPipe) query: ReportQueryDto): Promise<any> {
    return this.reportsService.getRevenueByCategory(query);
  }

  /**
   * FC-10-03: Báo cáo khách hàng mới / quay lại
   */
  @Get('customer-segments')
  getCustomerSegments(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getCustomerSegments(query);
  }

  /**
   * FC-10-03: Báo cáo điểm thưởng khách hàng
   * (Lưu ý: Chỉ báo cáo điểm HIỆN TẠI)
   */
  @Get('customer-points')
  getCustomerPoints() {
    return this.reportsService.getCustomerPoints();
  }

  @Get('profit-on-material-import')
  getProfit(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getProfitReport(query)
  }


  @Get('dashboard-stats')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('revenue-last-days')
  getRevenueLastNDays(@Query(ValidationPipe) query: RevenueLastDaysDto) {
    return this.reportsService.getRevenueLastNDays(query.days);
  }

  @Get('revenue-by-month')
  getRevenueByMonth(@Query(ValidationPipe) query: RevenueByMonthDto) {
    return this.reportsService.getRevenueByMonth(query);
  }

  @Get('revenue-by-year')
  getRevenueByYear(@Query(ValidationPipe) query: RevenueByYearDto) {
    return this.reportsService.getRevenueByYear(query);
  }

  /**
   * Biểu đồ top N sản phẩm bán chạy nhất
   * Dữ liệu: SUM(orderDetails.quantity) nhóm theo product.name, lấy top N
   * Sử dụng TopNRevenueDto để hỗ trợ limit, startDate, endDate
   */
  @Get('top-n-best-selling-products')
  getTopNBestSellingProducts(@Query(ValidationPipe) query: TopNRevenueDto) {
    return this.reportsService.getTopNBestSellingProducts(query);
  }

  /**
   * Biểu đồ phân bổ sản phẩm theo danh mục (Category Distribution)
   * Dữ liệu: COUNT(products) nhóm theo category.name
   * Không cần query params vì là phân bổ tổng thể
   */
  @Get('product-distribution-by-category')
  getProductDistributionByCategory() {
    return this.reportsService.getProductDistributionByCategory();
  }
}