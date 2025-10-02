import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order/create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) { }
