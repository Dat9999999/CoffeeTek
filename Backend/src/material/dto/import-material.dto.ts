import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class ImportMaterialDto {

    @IsNotEmpty()
    @Type(() => Number)
    materialId: number;

    @IsNotEmpty()
    @Type(() => Number)
    quantity: number;
}