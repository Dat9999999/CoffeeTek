import { Type } from "class-transformer";

export class CreateMaterialLossDto {
    materialId: number;
    quantity: number;
    reason: string;

    @Type(() => Date)
    date: string;
}
