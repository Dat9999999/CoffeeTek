import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";
import { GetAllDto } from "src/common/dto/pagination.dto";

export class GetAllAdjustmentHistoryDto extends GetAllDto {


    @IsNotEmpty()
    @Type(() => Date)
    date: Date;

    @IsOptional()
    @Type(() => Number)
    materialId?: number;
}