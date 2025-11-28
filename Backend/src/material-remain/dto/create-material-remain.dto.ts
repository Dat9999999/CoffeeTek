import { ArrayMinSize, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateMaterialRemainDto {
    @Type(() => Date)
    date: Date;

    @IsNumber()
    materialId: number;

    @IsOptional()
    @IsNumber()
    actualConsumed: number;
}
