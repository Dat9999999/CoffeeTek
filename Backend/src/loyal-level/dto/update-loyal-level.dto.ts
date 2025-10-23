import { PartialType } from '@nestjs/mapped-types';
import { CreateLoyalLevelDto } from './create-loyal-level.dto';

export class UpdateLoyalLevelDto extends PartialType(CreateLoyalLevelDto) {}
