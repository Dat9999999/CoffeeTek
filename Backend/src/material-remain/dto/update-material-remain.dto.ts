import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialRemainDto } from './create-material-remain.dto';
import { RemainRealityDto } from './RemainRealityDto.dto';
import { Type } from 'class-transformer';

export class UpdateMaterialRemainDto extends RemainRealityDto {
    @Type(() => Date)
    date: Date
}
