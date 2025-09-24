import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaClient) { }
  create(createOrderDto: CreateOrderDto) {
    return createOrderDto;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
