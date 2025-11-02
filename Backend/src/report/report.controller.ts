import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './report.service';
import { ReportQueryDto } from './dto/report-query.dto';


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
   * FC-10-02: Báo cáo sản phẩm bán chạy
   */
  @Get('best-selling-products')
  getBestSellingProducts(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getBestSellingProducts(query);
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo sản phẩm
   */
  @Get('revenue-by-product')
  getRevenueByProduct(@Query(ValidationPipe) query: ReportQueryDto) {
    return this.reportsService.getRevenueByProduct(query);
  }

  /**
   * FC-10-02: Báo cáo doanh thu theo nhóm sản phẩm (Category)
   */
  @Get('revenue-by-category')
  getRevenueByCategory(@Query(ValidationPipe) query: ReportQueryDto) {
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
}