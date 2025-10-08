import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllOrderDto } from './dto/GetAllOrder.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { PaymentDTO } from './dto/payment.dto';
import { OrderStatus } from 'src/common/enums/orderStatus.enum';
import { UpdateOrderStatusDTO } from './dto/UpdateOrderStatus.dto';
import { VnpayService } from 'nestjs-vnpay';
import { dateFormat, InpOrderAlreadyConfirmed, IpnFailChecksum, IpnInvalidAmount, IpnOrderNotFound, IpnSuccess, IpnUnknownError, ProductCode, VerifyReturnUrl, VnpLocale } from 'vnpay';
import { json } from 'express';

@Injectable()
export class OrderService {

  constructor(private prisma: PrismaService, private readonly vnpayService: VnpayService) { }
  async create(createOrderDto: CreateOrderDto) {
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
                  unit_price: toppings.find((p) => p.id == parseInt(t.toppingId))?.price ?? 0, // TODO: lấy từ topping.price
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
    if (paymentDTO.amount - (paymentDTO.change ?? 0) != order.final_price ||
      paymentDTO.amount < (paymentDTO.change ?? 0)
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
  async updateStatus(dto: UpdateOrderStatusDTO) {
    const order = await this.prisma.order.update({
      where: {
        id: dto.orderId
      },
      data: {
        status: dto.status
      }
    })
    return order;
  }
  async updateItems(id: number, updateItemsDto: UpdateOrderDto) {
    const toppings = await this.prisma.topping.findMany({
      where: {
        id: { in: updateItemsDto.order_details?.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []) }
      }
    })
    const productSizePrice = await this.prisma.productSize.findMany({
      where: {
        id: { in: updateItemsDto.order_details?.flatMap(i => i.sizeId ? [parseInt(i.sizeId)] : []) }
      }
    })
    const order_details = await Promise.all(
      (updateItemsDto.order_details ?? []).map(async (item) => {
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

    await this.prisma.$transaction(async (tx) => {
      await this.prisma.orderDetail.deleteMany({
        where: { id }
      });
      const order = await this.prisma.order.update({
        where: { id },
        data: {
          original_price: original_price,
          final_price: final_price,
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
                    unit_price: toppings.find((p) => p.id == parseInt(t.toppingId))?.price ?? 0, // TODO: lấy từ topping.price
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
    })
    return order_details;
  }
  async payOnline(paymentDTO: PaymentDTO) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const order = await this.prisma.order.findUnique({
      where: { id: paymentDTO.orderId }
    })
    if (!order) throw new NotFoundException();

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: order.final_price,
      //ip of client
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: paymentDTO.orderId.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${paymentDTO.orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:3001/api/order/vnpay-return',
      vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
      vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là thời gian hiện tại
      vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
    });
    return paymentUrl;
  }
  async vnpayResponse(query: any) {

    let verify: VerifyReturnUrl;
    try {
      verify = await this.vnpayService.verifyReturnUrl(query);
      if (!verify.isVerified) throw new BadRequestException("authenticate valid data failurely");
      if (!verify.isSuccess) throw new BadRequestException("Payment failure")
    } catch (error) {
      Logger.error(`Invalid data response VNpay ${error}`);
    }

    //handle UI 
    return { message: "Payment successfully" }
  }
  async vnpayIpn(query: any) {
    try {
      let verify: VerifyReturnUrl = await this.vnpayService.verifyIpnCall(query);
      if (!verify.isVerified) {
        Logger.error(IpnFailChecksum);
        return JSON.stringify(IpnFailChecksum);
      }

      if (!verify.isSuccess) {
        Logger.error(IpnUnknownError);
        return JSON.stringify(IpnUnknownError);
      }
      const foundOrder = await this.prisma.order.findUnique({ where: { id: parseInt(verify.vnp_TxnRef) } });
      if (!foundOrder) {
        Logger.error(IpnOrderNotFound);
        return JSON.stringify(IpnOrderNotFound);
      }
      // Nếu số tiền thanh toán không khớp
      if (verify.vnp_Amount !== foundOrder?.final_price) {
        Logger.error(IpnInvalidAmount);
        return JSON.stringify(IpnInvalidAmount);
      }

      // Nếu đơn hàng đã được xác nhận trước đó
      if (foundOrder?.status === OrderStatus.PAID || foundOrder?.status === OrderStatus.COMPLETED) {
        Logger.error(InpOrderAlreadyConfirmed);
        return JSON.stringify(InpOrderAlreadyConfirmed);
      }

      //update order status to paid 
      if (foundOrder) {
        this.updateStatus({ orderId: foundOrder.id, status: OrderStatus.PAID });
        Logger.log(IpnSuccess);
      }
      return JSON.stringify(IpnSuccess);
    } catch (error) {
      Logger.error(IpnUnknownError);
    }
  }

}
