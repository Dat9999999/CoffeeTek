import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class GetAllAdjustmentHistoryDto implements Readonly<GetAllAdjustmentHistoryDto> {

    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    @Type(() => Date)
    date: Date;

    @IsOptional()
    @Type(() => Number)
    materialId?: number;
}