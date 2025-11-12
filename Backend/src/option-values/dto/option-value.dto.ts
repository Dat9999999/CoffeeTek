import { IsString, IsInt, MinLength, IsNotEmpty, IsOptional, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export class CreateOptionValueDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsInt()
    @IsNotEmpty()
    option_group_id: number;

    @IsInt()
    @IsOptional()
    sort_index?: number;
}

export class UpdateOptionValueDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string;

    @IsInt()
    @IsOptional()
    option_group_id?: number;

    @IsInt()
    @IsOptional()
    sort_index?: number;
}

export class PaginationDto {
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    size: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    orderBy?: string = 'id';

    @IsEnum(OrderDirection)
    @IsOptional()
    orderDirection?: OrderDirection = OrderDirection.ASC;
}
