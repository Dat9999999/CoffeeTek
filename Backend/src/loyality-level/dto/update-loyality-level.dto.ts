import { PartialType } from '@nestjs/mapped-types';
import { CreateLoyalityLevelDto } from './create-loyality-level.dto';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLoyalityLevelDto extends PartialType(CreateLoyalityLevelDto) {
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    minPoint: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    discountRate: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    maxPoint: number;

    @IsOptional()
    description?: string;
}
