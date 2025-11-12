import { IsOptional, IsString, IsInt, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateProductDto {
    name: string;
    is_multi_size: boolean;
    product_detail?: string;
    price?: number;

    @IsOptional()
    @IsNumber()
    categoryId?: number | null;

    @IsOptional()
    sizeIds?: { id: number; price: number }[];

    @IsOptional()
    optionValueIds?: number[];

    @IsOptional()
    toppingIds?: number[];

    @IsOptional()
    images?: { image_name: string; sort_index: number }[];

    @IsNotEmpty()
    @IsBoolean()
    isTopping: boolean;
}
