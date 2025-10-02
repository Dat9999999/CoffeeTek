import { IsOptional, IsString } from "class-validator";
import { GetAllDto } from "src/common/dto/pagination.dto";

export class GetAllOrderDto extends GetAllDto {
    @IsOptional()
    @IsString()
    searchStatus?: string

    @IsOptional()
    @IsString()
    searchCustomerPhone?: string
}