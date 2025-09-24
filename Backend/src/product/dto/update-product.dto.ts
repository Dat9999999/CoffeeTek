import { IsBoolean, IsOptional, IsString, ValidateIf, IsArray, IsNumber } from "class-validator";

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    is_multi_size?: boolean;

    @IsOptional()
    @IsString()
    product_detail?: string;

    // Chỉ validate price nếu is_multi_size = false
    @ValidateIf((o) => o.is_multi_size === false)
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    categoryId?: number | null;

    // Nếu is_multi_size = true thì sizeIds phải có
    @ValidateIf((o) => o.is_multi_size === true)
    @IsArray()
    sizeIds?: { id: number; price: number }[];

    @IsOptional()
    optionValueIds?: number[];

    @IsOptional()
    toppingIds?: number[];

    @IsOptional()
    images?: { image_name: string; sort_index: number }[];
}
