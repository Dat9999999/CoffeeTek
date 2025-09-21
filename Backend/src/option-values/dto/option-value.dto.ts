import { IsString, IsInt, MinLength, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionValueDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsInt()
    sort_index: number;

    @IsInt()
    option_group_id: number;
}

export class UpdateOptionValueDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @IsOptional()
    name?: string;

    @IsInt()
    @IsOptional()
    sort_index?: number;

    @IsInt()
    @IsOptional()
    option_group_id?: number;
}

export class PaginationDto {
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit: number = 10;
}