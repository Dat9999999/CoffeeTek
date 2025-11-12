import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, Min } from "class-validator";
import { GetAllDto } from "src/common/dto/pagination.dto";

export class GetAllMaterialLossDto extends GetAllDto {
    @IsOptional()
    @IsString()
    date?: string;
}
