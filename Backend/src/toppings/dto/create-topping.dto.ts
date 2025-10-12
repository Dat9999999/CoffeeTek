import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateToppingDto {
    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    image_name?: string;

}
