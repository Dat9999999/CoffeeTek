import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialRemainDto } from './create-material-remain.dto';

export class UpdateMaterialRemainDto extends PartialType(CreateMaterialRemainDto) {}
