import { IsDate, IsNotEmpty } from "class-validator";
import { PromotionItemDto } from "./promotion-item.dto";
import { Type } from "class-transformer";

export class CreatePromotionDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startDate: string;
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    endDate: string;

    @IsNotEmpty({ each: true })
    items: PromotionItemDto[];
}
