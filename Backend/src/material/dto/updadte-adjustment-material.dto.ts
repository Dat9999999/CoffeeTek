import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class AdjustmentItemDto {
    @IsNotEmpty()
    @Type(() => Number)
    materailId: number;

    @IsNotEmpty()
    @Type(() => Number)
    realisticRemain: number;
}

export class UpdateConsumeInventoryDto {
    @IsNotEmpty({ each: true })
    @Type(() => AdjustmentItemDto)
    items: AdjustmentItemDto[];
}