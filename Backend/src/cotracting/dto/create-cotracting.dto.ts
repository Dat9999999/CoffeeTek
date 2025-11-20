import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCotractingDto {
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    date: Date;
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
    @IsNotEmpty()
    @IsNumber()
    materialId: number;

}
