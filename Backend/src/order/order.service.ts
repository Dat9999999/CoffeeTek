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
  async create(createOrderDto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: createOrderDto.orderItems.map(i => parseInt(i.productId)) }
      }
    })
    const toppings = await this.prisma.topping.findMany({
      where: {
        id: { in: createOrderDto.orderItems.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []) }
      }
    })
    const sizes = await this.prisma.size.findMany({
      where: {
        id: { in: createOrderDto.orderItems.flatMap(i => i.sizeId ? [parseInt(i.sizeId)] : []) }
      }
    })

    //create order
    // const order = await this.prisma.order.create({
    //   data: {
    //     customerPhone: createOrderDto.customerPhone,
    //     staffId: parseInt(createOrderDto.staffId),
    //     note: createOrderDto.notes,
    //     status: 'PENDING',
    //     // order_details: {
    //     //   create: createOrderDto.orderItems.map(item => {
    //     //     const product = products.find(p => p.id === parseInt(item.productId));
    //     //     const size = item.sizeId ? sizes.find(s => s.id === parseInt(item.sizeId)) : null;
    //     //     return {
    //     //       productId: parseInt(item.productId),
    //     //       quantity: item.quantity,
    //     //       sizeId: item.sizeId ? parseInt(item.sizeId) : null,
    //     //       price: product ? product.price : 0,
    //     //       sizePrice: size ? size. : 0,
    //     //       order_toppings: {
    //     //         create: item.toppingItems?.map(toppingItem => {
    //     //           const topping = toppings.find(t => t.id === parseInt(toppingItem.toppingId));
    //     //           return {
    //     //             toppingId: parseInt(toppingItem.toppingId),
    //     //             quantity: toppingItem.quantity,
    //     //             price: topping ? topping.price : 0
    //     //           }
    //     //         }) || []
    //     //       }
    //     //     }
    //     //   })
    //     // }
    //   },
    //   include: {
    //     order_details: {
    //       include: {
    //         order_toppings: true
    //       }
    //     }

    //   }
    // });
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
