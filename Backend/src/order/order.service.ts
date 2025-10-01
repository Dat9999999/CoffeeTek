import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService
  ) { }
  create(createOrderDto: CreateOrderDto) {
    const products = this.prisma.product.findMany({
      where: {
        id: { in: createOrderDto.orderItems.map(i => i.productId) }
      }
    })
    const toppings = this.prisma.topping.findMany({
      where: {
        id: { in: createOrderDto.orderItems.flatMap(i => i.toppingItems?.map(t => t.toppingId) || []) }
      }
    })
    console.log({ products, toppings });
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
