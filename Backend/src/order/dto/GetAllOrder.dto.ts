import { IsOptional, IsString, IsDateString } from "class-validator";
import { GetAllDto } from "src/common/dto/pagination.dto";

export class GetAllOrderDto extends GetAllDto {
    @IsOptional()
    @IsString()
    searchStatuses?: string; // Comma-separated statuses, e.g., "pending,paid"

    @IsOptional()
    @IsString()
    searchCustomerPhone?: string;

    @IsOptional()
    @IsDateString()
    searchFromDate?: string; // ISO date string, e.g., "2023-01-01"

    @IsOptional()
    @IsDateString()
    searchToDate?: string; // ISO date string, e.g., "2023-12-31"
}