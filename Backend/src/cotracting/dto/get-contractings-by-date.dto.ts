import { Req } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsDate } from "class-validator";
import { GetAllDto } from "src/common/dto/index.dto";

export class getContractingsByDateDto extends GetAllDto {
    @Type(() => Date)
    @IsDate()
    date: Date;
}