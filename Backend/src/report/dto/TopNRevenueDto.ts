import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportQueryDto } from './report-query.dto'; // Import ReportQueryDto

export class TopNRevenueDto extends ReportQueryDto {
    @IsOptional()
    @Type(() => Number) // Đảm bảo giá trị được chuyển thành số
    @IsInt()
    @Min(1)
    limit: number = 10; // Mặc định là Top 10 sản phẩm
}