import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ImportMaterialDto {

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({}, { message: "materialId must be a number" })
    materialId: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({}, { message: "consume must be a number" })
    consume: number;
}