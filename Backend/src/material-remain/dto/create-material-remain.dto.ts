import { ArrayMinSize } from "class-validator";
import { RemainRealityDto } from "./RemainRealityDto.dto";
import { Type } from "class-transformer";

export class CreateMaterialRemainDto {
    @Type(() => Date)
    date: Date;
    @ArrayMinSize(1)
    remainReality: RemainRealityDto[]
}
