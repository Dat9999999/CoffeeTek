import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllOrderDto } from './dto/GetAllOrder.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { PaymentDTO } from './dto/payment.dto';
import { OrderStatus } from 'src/common/enums/orderStatus.enum';
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }
  async create(createOrderDto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: createOrderDto.order_details.map((i) => parseInt(i.productId)),
        },
      }
    })
    const toppings = await this.prisma.topping.findMany({
      where: {
        id: { in: createOrderDto.order_details.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []) }
      }
    })
    const productSizePrice = await this.prisma.productSize.findMany({
      where: {
        id: { in: createOrderDto.order_details.flatMap(i => i.sizeId ? [parseInt(i.sizeId)] : []) }
      }
    })
    const order_details = await Promise.all(
      createOrderDto.order_details.map(async (item) => {
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

    const original_price = order_details.reduce((sum, item) => {
      const defaultProductPrice = item.product?.price || 0;

      // đảm bảo sizeId luôn có giá trị hợp lệ
      const sizeId = item.sizeId ? parseInt(item.sizeId) : null;
      const sizePrice = sizeId
        ? productSizePrice.find(s => s.id === sizeId)?.price ?? 0
        : 0;

      // đảm bảo quantity là số
      const quantity = item.quantity ? parseInt(item.quantity.toString()) : 0;

      // toppingPrice trả về tổng giá topping (nhân với quantity nếu muốn)
      const toppingTotal = toppingPrice(item) * quantity;

      return sum + (sizePrice ? sizePrice : defaultProductPrice) * quantity + toppingTotal;
    }, 0);



    // Tính toán giá gốc và giá cuối cùng sau khi áp dụng voucher/ khuyến mãi khách hàng thân thiết 
    const final_price = original_price;
    //create order
    const order = await this.prisma.order.create({
      data: {
        customerPhone: createOrderDto.customerPhone,
        original_price: original_price,
        final_price: final_price,
        note: createOrderDto.note,
        staffId: parseInt(createOrderDto.staffId),
        order_details: {
          create: order_details.map(item => ({
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

  async findAll(query: GetAllOrderDto) {
    const { page, size, searchName, searchStatus, orderBy } = query;
    if (!page || !size) {
      throw new Error("page and size are required");
    }
    const skip = (page - 1) * size;


    const [data, total] = await Promise.all([this.prisma.order.findMany({
      skip,
      take: size,
      where: {
        status: searchStatus ?? {},
        //for search by name, this name is customer's phone
        customerPhone: searchName ?? {}
      },
      orderBy: { id: orderBy }
    }), this.prisma.order.count()]);
    const res: ResponseGetAllDto<any> = {
      data: data,
      meta: {
        page: page,
        size: size,
        total: total,
        totalPages: Math.ceil(total / size)
      }
    }
    return res;
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_details: {
          include: {
            product: true,
            size: true
          }
        },
      },
    });
    if (order === null) throw new NotFoundException(`not found order id = ${id}`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const upateOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!upateOrder) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        customerPhone: updateOrderDto.customerPhone ?? upateOrder.customerPhone,
        note: updateOrderDto.note ?? upateOrder.note,
      },
    });

    return updatedOrder;
  }

  async remove(id: number) {
    const deleteOrder = await this.prisma.order.delete({
      where: { id }
    })
    if (!deleteOrder) throw new NotFoundException(`Notfound order id = ${id}`)
    return deleteOrder
  }
  async payByCash(paymentDTO: PaymentDTO) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: paymentDTO.orderId,
      },
    });
    if (!order) throw new NotFoundException("this order is not exist!");
    if (order.status != OrderStatus.PENDING) throw new BadRequestException("Can only make a payment with order status = pending");
    if (paymentDTO.amount < order.final_price) throw new BadRequestException("Invalid amount, amount must greater or equal final price");
    if (paymentDTO.amount - paymentDTO.change != order.final_price ||
      paymentDTO.amount < paymentDTO.change
    ) throw new BadRequestException("Change is invalid");
    return await this.prisma.order.update({
      where: {
        id: paymentDTO.orderId
      },
      data: {
        status: OrderStatus.PAID,
        change: paymentDTO.amount - order.final_price
      }
    })
  }
}
