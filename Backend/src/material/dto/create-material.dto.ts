import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class CreateMaterialDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    @Type(() => Number)
    unitId: number;

    @IsNotEmpty()
    @Type(() => String)
    code: string;
}
