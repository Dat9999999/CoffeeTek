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
    const orderItems = await Promise.all(
      createOrderDto.orderItems.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: parseInt(item.productId) },
        });

        const toppings = item.toppingItems?.length
          ? await this.prisma.topping.findMany({
            where: { id: { in: item.toppingItems.map(t => parseInt(t.toppingId)) } },
          })
          : [];

        const size = item.sizeId
          ? await this.prisma.size.findUnique({
            where: { id: parseInt(item.sizeId) },
          })
          : null;

        return {
          ...item, // giữ lại quantity, productId, toppingItems, sizeId...
          product,
          toppings,
          size,
        };
      })
    );

    const toppingPrice = (item) => {
      return item.toppingItems?.reduce((sum, t) => {
        const topping = toppings.find(tp => tp.id === parseInt(t.toppingId));
        return sum + (topping ? topping.price * parseInt(t.quantity) : 0);
      }, 0) || 0;
    };
    const original_price = orderItems.reduce((sum, item) => {
      const productPrice = item.product?.price || 0;
      return sum + (productPrice + toppingPrice(item)) * parseInt(item.quantity);
    }, 0);

    
    const final_price = original_price;
    // Tính toán giá gốc và giá cuối cùng
    //create order
    const order = await this.prisma.order.create({
      data: {
        customerPhone: createOrderDto.customerPhone,
        original_price: 0,
        final_price: 0,
        note: createOrderDto.notes,
        staffId: parseInt(createOrderDto.staffId),
        order_details: {
          create: orderItems.map(item => ({
            quantity: parseInt(item.quantity),
            unit_price: item.product?.price || 0,

            product: {
              connect: { id: parseInt(item.productId) }
            },

            size: item.sizeId
              ? { connect: { id: parseInt(item.sizeId) } }
              : undefined,

            ToppingOrderDetail: item.toppingItems?.length
              ? {
                create: item.toppingItems.map(t => ({
                  quantity: parseInt(t.quantity),
                  unit_price: 0, // TODO: lấy từ topping.price
                  topping: { connect: { id: parseInt(t.toppingId) } }
                }))
              }
              : undefined,
          }))
        }
      },
      include: {
        order_details: {
          include: {
            product: true,
            size: true,
            ToppingOrderDetail: {
              include: {
                topping: true
              }
            }
          }
        }
      }
    });
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
