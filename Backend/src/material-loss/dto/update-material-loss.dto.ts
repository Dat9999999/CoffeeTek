import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialLossDto } from './create-material-loss.dto';

export class UpdateMaterialLossDto extends PartialType(CreateMaterialLossDto) {}
