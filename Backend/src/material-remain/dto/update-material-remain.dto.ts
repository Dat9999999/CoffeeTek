import { Type } from 'class-transformer';
import { create } from 'domain';
import { CreateMaterialRemainDto } from './create-material-remain.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';

export class UpdateMaterialRemainDto extends PartialType(CreateMaterialRemainDto) {
    @IsNumber()
    actualRemain: number;
}
