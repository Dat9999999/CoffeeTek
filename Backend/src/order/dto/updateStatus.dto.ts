import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateStatusDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @IsString()
    status: String

}