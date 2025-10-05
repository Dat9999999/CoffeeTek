import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateOrderStatusDTO {
    @IsNotEmpty()
    @Type(() => Number)
    orderId: number;

    @IsNotEmpty()
    @IsString()
    status: String

}