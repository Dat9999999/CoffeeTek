import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class AdjustmentItemDto {
    @IsNotEmpty()
    @Type(() => Number)
    recordIds: number;

    @IsNotEmpty()
    @Type(() => Number)
    consume: number;
}

export class UpdateConsumeInventoryDto {
    @IsNotEmpty({ each: true })
    @Type(() => AdjustmentItemDto)
    items: AdjustmentItemDto[];
}