import { PartialType } from '@nestjs/mapped-types';
import { CreateLoyalityLevelDto } from './create-loyality-level.dto';

export class UpdateLoyalityLevelDto extends PartialType(CreateLoyalityLevelDto) {}
