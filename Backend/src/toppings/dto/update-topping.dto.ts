import { PartialType } from '@nestjs/mapped-types';
import { CreateToppingDto } from './create-topping.dto';

export class UpdateToppingDto extends PartialType(CreateToppingDto) { }
