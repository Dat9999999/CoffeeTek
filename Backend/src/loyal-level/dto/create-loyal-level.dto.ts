import { IsNotEmpty, IsNumber, Min } from "class-validator"

export class CreateLoyalLevelDto {
    @IsNotEmpty()
    name: string


    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    requirePoint: number
}
