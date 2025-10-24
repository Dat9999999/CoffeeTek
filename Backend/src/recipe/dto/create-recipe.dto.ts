import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { ImportMaterialDto } from "./recipe-item.dto";

export class CreateRecipeDto {

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({}, { message: "productId must be a number" })
    productId: number;


    @IsArray()
    @ArrayMinSize(1, { message: "materials must contain at least one item" })
    @ValidateNested({ each: true })
    @Type(() => ImportMaterialDto)
    materials: ImportMaterialDto[];

    @IsNotEmpty()
    @IsOptional()
    sizeId: number

}
