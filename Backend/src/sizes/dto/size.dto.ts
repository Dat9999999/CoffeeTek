import { IsInt, Min, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDirection } from 'src/common/enums/order.enum';

export class CreateSizeDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsInt()
    @Type(() => Number)
    sort_index: number;
}

export class UpdateSizeDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @IsOptional()
    name?: string;

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
    search?: string;

    @IsOptional()
    orderBy?: string = 'id';

    @IsEnum(OrderDirection)
    @IsOptional()
    orderDirection?: OrderDirection = OrderDirection.ASC;
}