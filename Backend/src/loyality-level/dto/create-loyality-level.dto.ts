import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateLoyalityLevelDto {
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    minPoint: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    discountRate: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    maxPoint: number;

    @IsOptional()
    description?: string;

}
