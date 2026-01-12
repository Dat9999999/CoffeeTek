import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllOrderDto } from './dto/GetAllOrder.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { PaymentDTO } from './dto/payment.dto';
import { OrderStatus } from 'src/common/enums/orderStatus.enum';
import { UpdateOrderStatusDTO } from './dto/UpdateOrderStatus.dto';
import { VnpayService } from 'nestjs-vnpay';
import {
  dateFormat,
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ProductCode,
  VerifyReturnUrl,
  VnpLocale,
} from 'vnpay';
import { PaymentMethod } from 'src/common/enums/paymentMethod.enum';
import { InvoiceService } from 'src/invoice/invoice.service';
import { B2Service } from 'src/storage-file/b2.service';
import { EventsGateway } from 'src/events/events.gateway';
import { ClientProxy } from '@nestjs/microservices';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private readonly vnpayService: VnpayService,
    private readonly invoiceService: InvoiceService,
    private readonly b2Service: B2Service,
    private readonly eventsGateway: EventsGateway,
    @Inject('ORDER_EMAIL_SERVICE') private readonly emailClient: ClientProxy,
    private readonly mailService: MailService,
  ) { }

  async getInvoice(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!order)
      throw new NotFoundException(`Not found invoice of order ${orderId}`);
    if (!order.invoiceUrl)
      throw new BadRequestException(
        `order ${orderId} stills pending or canceled`,
      );
    const key = order.invoiceUrl;

    return this.b2Service.getSignedUrl(key);
  }


  async create(createOrderDto: CreateOrderDto) {
    const allToppingIds = createOrderDto.order_details.flatMap(
      (i) => i.toppingItems?.map((t) => parseInt(t.toppingId)) || [],
    );
    const allToppings = await this.prisma.product.findMany({
      where: { id: { in: allToppingIds } },
    });

    const toppings = await this.prisma.product.findMany({
      where: {
        id: { in: createOrderDto.order_details.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []) }
      }
    })
    const order_details = await Promise.all(

      createOrderDto.order_details.map(async (item) => {
        const now = new Date();
        const productIdNum = parseInt(item.productId);

        const product = await this.prisma.product.findUnique({
          where: { id: productIdNum },
          include: {
            Recipe: { include: { MaterialRecipe: true } },
            // Include `sizes` to get the ProductSize JOIN TABLE data
            sizes: true,
            toppings: true,
          },
        });

        // 1. Find the specific Size object (to get its name/etc)
        const size = item.sizeId
          ? await this.prisma.size.findUnique({
            where: { id: parseInt(item.sizeId) },
          })
          : null;

        // 2. Find the specific ProductSize record to get the price
        // product.sizes is the ProductSize[] array. We find the entry that links to the size.id
        const productSize = product?.sizes.find(
          (ps) => ps.size_id === size?.id,
        );

        // Filter the globally fetched toppings for this specific order item (optional, but cleaner)
        const itemToppings = item.toppingItems?.length
          ? allToppings.filter((t) =>
            item.toppingItems!.some((ti) => parseInt(ti.toppingId) === t.id),
          )
          : [];
        // const productPromotion = await this.prisma.productPromotion.findFirst({
        //   where: {
        //     AND:[
        //       {
        //         productId: product?.id},
        //       {

        //       }
        //       ]

        //   }
        // });
        const promotionActive = await this.prisma.promotion.findFirst({
          where: {
            AND: [
              {
                is_active: true
              },
              {
                start_date: {
                  lt: now
                },
                end_date: {
                  gte: now
                }
              }
            ]
          },
          include: {
            ProductPromotion: {
              where: item?.sizeId
                ? {
                  productId: productIdNum,
                  productSizeId: parseInt(item.sizeId),
                }
                : {
                  productId: productIdNum,
                },
            }
          }

        })
        const productPromotion = promotionActive?.ProductPromotion
        const optionValue = item.optionId ?? []

        return {
          ...item,
          product, // Full product object
          toppings: itemToppings, // Toppings for this item
          size, // Full size object
          productSize, // The specific ProductSize record (contains the correct price)
          productPromotion,
          optionValue
        };
      }),
    );

    const toppingPrice = (itemDetail) => {
      return (
        itemDetail.toppingItems?.reduce((sum, t) => {
          const topping = allToppings.find(
            (tp) => tp.id === parseInt(t.toppingId),
          );
          return sum + (topping?.price ?? 0) * parseInt(t.quantity);
        }, 0) || 0
      );
    };

    let original_price = 0;
    for (const item of order_details) {
      // check if this product in promtion or not 
      const productPromotion = item.productPromotion

      // 1. Get Base/Unit Price
      const defaultProductPrice = item.product?.price || 0;

      // Use the price from the CORRECT ProductSize object, or fall back to the default product price
      const unitPrice = productPromotion?.find(i => i.productId == parseInt(item.productId))?.new_price || item.productSize?.price || defaultProductPrice;

      // 2. Get Quantity
      const quantity = item.quantity ? parseInt(item.quantity.toString()) : 0;

      // 3. Get Topping Total
      const toppingTotal = toppingPrice(item) * quantity;

      // Sum: (Unit Price * Quantity) + Topping Price
      original_price += (unitPrice * quantity) + toppingTotal;
    }

    // Tính toán giá gốc và giá cuối cùng trước khi áp dụng voucher/ khuyến mãi khách hàng thân thiết
    const final_price = original_price;
    //create order

    const newOrder = await this.prisma.$transaction(async (tx) => {

      for (const item of order_details) {
        // 1. KIỂM TRA TỒN TẠI (Lỗi bạn đang gặp)
        if (!item.product) {
          const productId = item.productId;
          throw new BadRequestException(
            `Product ${productId} not found in database.`,
          );
        }

        // 2. KIỂM TRA CÁC ĐIỀU KIỆN NGHIỆP VỤ KHÁC
        // Gộp tất cả các điều kiện logic vào một khối IF lớn
        if (
          // A. Sản phẩm không hoạt động
          !item.product.isActive ||
          // B. Sản phẩm không có Recipe (null/undefined)
          !item.product.Recipe ||
          // C. Sản phẩm có Recipe nhưng mảng rỗng (không có công thức nào)
          item.product.Recipe.length === 0 ||
          // D. TẤT CẢ các Recipe đều không có MaterialRecipe (công thức không đầy đủ)
          item.product.Recipe.every(
            (r: any) => !r.MaterialRecipe || r.MaterialRecipe.length === 0,
          )
        ) {
          const productNameOrId = item.product.name ?? item.productId;
          throw new BadRequestException(
            `Product ${productNameOrId} is inactive, not found, or has an incomplete recipe.`,
          );
        }
      }

      return await tx.order.create({
        data: {
          customerPhone: createOrderDto.customerPhone,
          original_price: original_price,
          final_price: final_price,
          note: createOrderDto.note,
          staffId: parseInt(createOrderDto.staffId),
          order_details: {
            create: order_details.map((item) => ({
              product_name: item.product?.name,
              quantity: parseInt(item.quantity),
              unit_price: item.productPromotion?.find(e => e.productId == parseInt(item.productId))?.new_price || item.productSize?.price || item.product?.price || 0,

              product: {
                connect: { id: parseInt(item.productId) },
              },

              size: item.sizeId
                ? { connect: { id: parseInt(item.sizeId) } }
                : undefined,

              ToppingOrderDetail: item.toppingItems?.length
                ? {
                  create: item.toppingItems.map((t) => ({
                    quantity: parseInt(t.quantity),
                    unit_price:
                      toppings.find((p) => p.id == parseInt(t.toppingId))
                        ?.price ?? 0,
                    topping: { connect: { id: parseInt(t.toppingId) } },
                  })),
                }
                : undefined,
              optionValue: item.optionValue.length > 0
                ? {
                  connect: item.optionValue
                    .map(id => ({ id: parseInt(id) }))
                }
                : undefined,
            })),
          },
        },
        include: {
          order_details: {
            include: {
              product: true,
              size: true,
              ToppingOrderDetail: {
                include: {
                  topping: true,
                },
              },
            },
          },
        },
      });

    });

    //  4. PHÁT SỰ KIỆN SAU KHI TRANSACTION THÀNH CÔNG
    this.logger.log(`📡 Triggering order events for new order ID: ${newOrder.id}`);

    await this.broadcastNewOrder(newOrder);
    await this.broadcastProcessOrderCount();
    
    this.logger.log(`✅ Order events completed for order ID: ${newOrder.id}`);
    return newOrder;
  }

  async broadcastNewOrder(order: any) {
    try {
      this.logger.log(`📢 Broadcasting new order event - Order ID: ${order?.id}, Status: ${order?.status}, Customer: ${order?.customerPhone || 'N/A'}`);
      
      this.eventsGateway.sendToAll('newOrder', order);
      
      this.logger.log(`✅ Successfully broadcasted new order event - Order ID: ${order?.id}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast new order event - Order ID: ${order?.id}`, error);
      // Don't throw - event broadcasting failure shouldn't break the order creation
    }
  }

  async broadcastProcessOrderCount() {
    try {
      this.logger.log('📊 Calculating process order count (pending + paid orders)...');
      
      // 1. Đếm TỔNG SỐ LƯỢNG đơn hàng có trạng thái 'pending' HOẶC 'paid'
      const totalProcessOrderCount = await this.prisma.order.count({
        where: {
          status: {
            in: [OrderStatus.PENDING, OrderStatus.PAID], // Lấy tổng của cả hai
          },
        },
      });

      this.logger.log(`📢 Broadcasting process order count event - Count: ${totalProcessOrderCount}`);

      // 2. Phát sự kiện (ví dụ: 'activeOrderCount')
      this.eventsGateway.sendToAll('processOrderCount', totalProcessOrderCount);

      this.logger.log(`✅ Successfully broadcasted process order count - Count: ${totalProcessOrderCount}`);
    } catch (error) {
      this.logger.error('❌ Failed to broadcast process order count', error);
      // Don't throw - event broadcasting failure shouldn't break the operation
    }
  }

  async getProcessOrderCount() {
    const count = await this.prisma.order.count({
      where: {
        status: {
          in: ["pending", "paid"],
        },
      },
    });
    return { count }; // Trả về dạng { count: 10 }
  }

  async findAll(query: GetAllOrderDto) {
    const {
      page,
      size,
      searchCustomerPhone,
      searchStatuses,
      searchFromDate,
      searchToDate,
      orderBy = 'id',
      orderDirection = 'asc',
    } = query;

    if (!page || !size) {
      throw new Error('page and size are required');
    }

    const skip = (page - 1) * size;

    // ===== Build dynamic where =====
    const where: any = {};

    if (searchStatuses && searchStatuses.trim() !== '') {
      const statuses = searchStatuses.split(',').map((s) => s.trim());
      where.status = { in: statuses };
    }

    if (searchCustomerPhone && searchCustomerPhone.trim() !== '') {
      where.customerPhone = {
        contains: searchCustomerPhone,
        mode: 'insensitive',
      };
    }

    if (searchFromDate || searchToDate) {
      where.created_at = {};
      if (searchFromDate) {
        where.created_at.gte = new Date(searchFromDate);
      }
      if (searchToDate) {
        const endDate = new Date(searchToDate);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    // Chỉ tính doanh thu cho completed
    // const whereCompleted = { ...where, status: 'completed' };
    const whereCompleted =
      where.status && !where.status.in.includes('completed')
        ? { ...where, status: { in: [] } } // không có đơn nào
        : { ...where, status: { in: ['completed'] } };

    // ===== Truy vấn song song =====
    const [data, total, aggregates, customerStats, peakHourStats] =
      await Promise.all([
        this.prisma.order.findMany({
          skip,
          take: size,
          where,
          include: {
            order_details: {
              include: {
                product: { include: { images: true } },
                size: true,
                ToppingOrderDetail: {
                  include: {
                    topping: { include: { images: true } },
                  },
                },
                optionValue: { include: { option_group: true } },
              },
            },
            Customer: true,
            Staff: true,
          },
          orderBy: { [orderBy]: orderDirection },
        }),

        this.prisma.order.count({ where }),

        this.prisma.order.aggregate({
          where: whereCompleted,
          _sum: {
            final_price: true,
            original_price: true,
          },
          _avg: {
            final_price: true,
          },
        }),

        // Lấy danh sách khách hàng và số lần đặt hàng
        this.prisma.order.groupBy({
          by: ['customerPhone'],
          where: whereCompleted,
          _count: { customerPhone: true },
        }),

        // Thống kê khung giờ có nhiều đơn nhất
        this.prisma.$queryRawUnsafe<{
          hour: number;
          order_count: number;
        }[]>(`
        SELECT EXTRACT(HOUR FROM "created_at") AS hour, COUNT(*) AS order_count
        FROM "orders"
        WHERE status = 'completed'
        ${where.created_at?.gte ? `AND "created_at" >= '${where.created_at.gte.toISOString()}'` : ''}
        ${where.created_at?.lte ? `AND "created_at" <= '${where.created_at.lte.toISOString()}'` : ''}
        GROUP BY hour
        ORDER BY order_count DESC
        LIMIT 1
      `),
      ]);

    // ===== Tính toán thống kê =====
    const totalRevenue = aggregates._sum.final_price || 0;
    const totalOriginal = aggregates._sum.original_price || 0;
    const totalDiscount = totalOriginal - totalRevenue;
    const averageOrderValue = aggregates._avg.final_price || 0;

    const uniqueCustomers = customerStats.filter((c) => c.customerPhone).length;
    const repeatCustomers = customerStats.filter(
      (c) => c._count.customerPhone > 1
    ).length;

    const peakHours =
      peakHourStats.length > 0
        ? {
          hour: Number(peakHourStats[0].hour),
          orderCount: Number(peakHourStats[0].order_count),
        }
        : null;

    // ===== Kết quả trả về =====
    return {
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),

        totalRevenue,

        totalDiscount,
        totalOriginal,
        averageOrderValue,
        uniqueCustomers,
        repeatCustomers,
        peakHours,
      },
    };
  }


  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_details: {
          include: {
            product: { include: { images: true } },
            size: true,
            ToppingOrderDetail: {
              include: {
                topping: { include: { images: true } },
              },
            },
            optionValue: { include: { option_group: true } },
          },
        },
        Customer: true,
        Staff: true,
      },
    });
    if (order === null)
      throw new NotFoundException(`not found order id = ${id}`);
    return order;
  }

  async getOrderHistoryByCustomerPhone(customerPhone: string, page: number = 1, size: number = 20) {
    const skip = (page - 1) * size;

    const where = {
      customerPhone: customerPhone,
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: size,
        include: {
          order_details: {
            include: {
              product: { include: { images: true } },
              size: true,
              ToppingOrderDetail: {
                include: {
                  topping: { include: { images: true } },
                },
              },
              optionValue: { include: { option_group: true } },
            },
          },
          Customer: true,
          Staff: true,
        },
        orderBy: { created_at: 'desc' }, // Newest first
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
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
      where: { id },
    });
    if (!deleteOrder) throw new NotFoundException(`Notfound order id = ${id}`);
    
    this.logger.log(`📡 Triggering process order count event after deleting order ID: ${id}`);
    await this.broadcastProcessOrderCount();

    return deleteOrder;
  }

  async payByCash(paymentDTO: PaymentDTO) {
    let order = await this.prisma.order.findUnique({
      where: {
        id: paymentDTO.orderId,
      },
    });
    if (!order) throw new NotFoundException('this order is not exist!');
    if (order.status != OrderStatus.PENDING)
      throw new BadRequestException(
        'Can only make a payment with order status = pending',
      );
    if (paymentDTO.amount < order.final_price)
      throw new BadRequestException(
        'Invalid amount, amount must greater or equal final price',
      );
    // if (paymentDTO.amount - (paymentDTO.change ?? 0) <= order.final_price ||
    //   paymentDTO.amount < (paymentDTO.change ?? 0)
    // ) throw new BadRequestException("Change is invalid");

    // validate voucher and apply discount
    if (paymentDTO.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: paymentDTO.voucherCode },
      });
      if (!voucher || !voucher.is_active)
        throw new BadRequestException(
          `invalid voucher code or voucher is inactive :${paymentDTO.voucherCode}`,
        );

      //update price for order
      order = await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          final_price:
            order.original_price -
            order.original_price * (voucher.discount_percentage / 100),
        },
      });

      //mark voucher was used
      await this.prisma.voucher.update({
        where: {
          id: voucher.id,
        },
        data: {
          is_active: false,
        },
      });
    }

    //create payment detail
    const paymentDetail = await this.createPaymentDetail(
      PaymentMethod.CASH,
      order.id,
      paymentDTO.amount,
      order.final_price,
    );

    return this.updateStatus(
      { orderId: paymentDTO.orderId, status: OrderStatus.PAID },
      paymentDetail.id,
    );
  }

  async updateStatus(dto: UpdateOrderStatusDTO, paymentDetailId?: number) {
    const order = await this.prisma.order.update({
      where: {
        id: dto.orderId,
      },
      data: {
        status: dto.status,
        paymentDetailId: paymentDetailId,
      },
    });

    //create invoice when user paid sucessfully
    if (dto.status == OrderStatus.PAID) {
      const items = await this.prisma.orderDetail.findMany({
        where: {
          order_id: order.id,
        },
      });
      const { key, pdfBuffer } = await this.invoiceService.createInvoice(
        order,
        items,
      );

      // store this pdf to private bucket
      await this.b2Service.uploadFile(
        key,
        pdfBuffer,
        'application/pdf',
        process.env.B2_PRIVATE_BUCKET,
      );

      // store invoice url into db
      await this.prisma.order.update({
        where: {
          id: dto.orderId,
        },
        data: {
          invoiceUrl: key,
        },
      });
    }

    // 🆕 Send email when order is COMPLETED
    if (dto.status == OrderStatus.COMPLETED && order.customerPhone) {
      const payload = {
        orderId: order.id,
        customerPhone: order.customerPhone,
        finalPrice: order.final_price,
      };
      
      this.logger.log(`📧 Emitting email event for completed order ${order.id}, customer ${order.customerPhone}`);
      try {
        this.emailClient.emit('order_completed_email', payload);
        this.logger.log(`✅ Email event emitted successfully for order ${order.id}`);
      } catch (error) {
        this.logger.error(`❌ Failed to emit email event for order ${order.id}:`, error);
      }
    }

    this.logger.log(`📡 Triggering process order count event after updating order ID: ${dto.orderId} to status: ${dto.status}`);
    await this.broadcastProcessOrderCount();

    this.logger.log(`✅ Order status update completed for order ID: ${dto.orderId}, new status: ${dto.status}`);
    return order;
  }

  async updateItems(id: number, updateItemsDto: UpdateOrderDto) {
    // 1. TÌM NẠP DỮ LIỆU
    const allToppingIds = updateItemsDto.order_details?.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []);
    const allToppings = await this.prisma.product.findMany({
      where: { id: { in: allToppingIds } }
    });

    // 2. XỬ LÝ CHI TIẾT
    const order_details = await Promise.all(
      (updateItemsDto.order_details || []).map(async (item) => {
        // <<< THAY ĐỔI: Thêm 'now' để kiểm tra khuyến mãi
        const now = new Date();
        const productIdNum = parseInt(item.productId);

        const product = await this.prisma.product.findUnique({
          where: { id: productIdNum },
          include: {
            Recipe: { include: { MaterialRecipe: true } },
            sizes: true,
          }
        });

        const size = item.sizeId
          ? await this.prisma.size.findUnique({ where: { id: parseInt(item.sizeId) } })
          : null;

        const productSize = product?.sizes.find(ps => ps.size_id === size?.id);

        const itemToppings = item.toppingItems?.length
          ? allToppings.filter(t => item.toppingItems!.some(ti => parseInt(ti.toppingId) === t.id))
          : [];

        // <<< THAY ĐỔI: Logic tìm khuyến mãi mới, giống hệt 'create'
        const promotionActive = await this.prisma.promotion.findFirst({
          where: {
            AND: [
              { is_active: true },
              { start_date: { lte: now } }, // Sử dụng lte để bao gồm cả thời điểm bắt đầu
              { end_date: { gte: now } }
            ]
          },
          include: {
            ProductPromotion: {
              where: {
                productId: productIdNum
                // TODO: Bạn có thể cần lọc thêm theo productSizeId tại đây
                // productSizeId: productSize ? productSize.id : null
              }
            }
          }
        });
        // productPromotion bây giờ là một MẢNG hoặc undefined
        const productPromotion = promotionActive?.ProductPromotion;

        const optionValue = item.optionId ?? []
        const productQuantity = item.quantity

        return {
          ...item,
          product,
          toppings: itemToppings,
          size,
          productSize,
          productPromotion, // <<< THAY ĐỔI: Truyền mảng này đi
          optionValue,
          productQuantity
        };
      }),
    );

    // 3. TÍNH GIÁ
    const toppingPrice = (itemDetail) => {
      return itemDetail.toppingItems?.reduce((sum, t) => {
        const topping = allToppings.find(tp => tp.id === parseInt(t.toppingId));
        return sum + ((topping?.price ?? 0) * parseInt(t.quantity));
      }, 0) || 0;
    };

    let original_price = 0;
    for (const item of order_details) {
      // <<< THAY ĐỔI: item.productPromotion là một mảng
      const productPromotion = item.productPromotion;
      const defaultProductPrice = item.product?.price || 0;

      // <<< THAY ĐỔI: Logic giá mới, dùng .find()
      const unitPrice = productPromotion?.find(i => i.productId == parseInt(item.productId))?.new_price
        || item.productSize?.price
        || defaultProductPrice;

      const quantity = item.quantity ? parseInt(item.quantity.toString()) : 0;
      const toppingTotal = toppingPrice(item) * quantity;
      original_price += (unitPrice * quantity) + toppingTotal;
    }

    const final_price = original_price;

    // 4. TRANSACTION: Cập nhật Order
    return await this.prisma.$transaction(async (tx) => {

      // <<< SỬA LỖI: Xóa theo 'orderId', không phải 'id'
      await tx.orderDetail.deleteMany({
        where: { order_id: id } // 'id' là Order.id được truyền vào hàm
      });

      // b. KIỂM TRA NGHIỆP VỤ (Giữ nguyên logic 'create')
      for (const item of order_details) {
        if (!item.product) {
          throw new BadRequestException(`Product ${item.productId} not found in database.`);
        }

        if (
          !item.product.isActive ||
          !item.product.Recipe ||
          item.product.Recipe.length === 0 ||
          item.product.Recipe.every((r: any) => !r.MaterialRecipe || r.MaterialRecipe.length === 0)
        ) {
          const productNameOrId = item.product.name ?? item.productId;
          throw new BadRequestException(`Product ${productNameOrId} is inactive, not found, or has an incomplete recipe.`);
        }
      }

      // c. Cập nhật Order và tạo các order_details MỚI
      const updatedOrder = await tx.order.update({
        where: { id: id },
        data: {
          original_price: original_price,
          final_price: final_price,
          customerPhone: updateItemsDto.customerPhone,
          note: updateItemsDto.note,
          staffId: updateItemsDto.staffId ? parseInt(updateItemsDto.staffId) : undefined,

          // Tạo các order_details MỚI
          order_details: {
            create: order_details.map(item => ({
              product_name: item.product?.name,
              quantity: parseInt(item.productQuantity),

              // <<< THAY ĐỔI: Logic giá mới, dùng .find()
              unit_price: item.productPromotion?.find(e => e.productId == parseInt(item.productId))?.new_price
                || item.productSize?.price
                || item.product?.price
                || 0,

              product: {
                connect: { id: parseInt(item.productId) },
              },

              size: item.sizeId
                ? { connect: { id: parseInt(item.sizeId) } }
                : undefined,

              ToppingOrderDetail: item.toppingItems?.length
                ? {
                  create: item.toppingItems.map(t => ({
                    quantity: parseInt(t.quantity),
                    unit_price: allToppings.find((p) => p.id == parseInt(t.toppingId))?.price ?? 0,
                    topping: { connect: { id: parseInt(t.toppingId) } }
                  }))
                }
                : undefined,

              optionValue: item.optionValue.length > 0
                ? {
                  connect: item.optionValue
                    .map(id => ({ id: parseInt(id) }))
                }
                : undefined,
            })),
          },
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
          },
        },
      });

      return updatedOrder;
    });
  }

  async payOnline(paymentDTO: PaymentDTO) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let order = await this.prisma.order.findUnique({
      where: { id: paymentDTO.orderId },
    });
    if (!order) throw new NotFoundException();
    // validate voucher and apply discount
    if (paymentDTO.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: paymentDTO.voucherCode },
      });
      if (!voucher || !voucher.is_active)
        throw new BadRequestException(
          `invalid voucher code or voucher is inactive :${paymentDTO.voucherCode}`,
        );

      //update price for order
      order = await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          final_price:
            order.original_price -
            order.original_price * (voucher.discount_percentage / 100),
        },
      });

      //mark voucher was used
      await this.prisma.voucher.update({
        where: {
          id: voucher.id,
        },
        data: {
          is_active: false,
        },
      });
    }

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: order.final_price,
      //ip of client
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: paymentDTO.orderId.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${paymentDTO.orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.FRONTEND_URL_RETURN_PAYMENT || 'http://localhost:3001/api/order/vnpay-return',
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
      if (!verify.isVerified)
        throw new BadRequestException('authenticate valid data failurely');
      if (!verify.isSuccess) throw new BadRequestException('Payment failure');
    } catch (error) {
      Logger.error(`Invalid data response VNpay ${error}`);
    }

    //handle UI
    return { message: 'Payment successfully' };
  }

  async vnpayIpn(query: any) {
    try {
      let verify: VerifyReturnUrl =
        await this.vnpayService.verifyIpnCall(query);
      if (!verify.isVerified) {
        Logger.error(IpnFailChecksum);
        return JSON.stringify(IpnFailChecksum);
      }

      if (!verify.isSuccess) {
        Logger.error(IpnUnknownError);
        return JSON.stringify(IpnUnknownError);
      }
      const foundOrder = await this.prisma.order.findUnique({
        where: { id: parseInt(verify.vnp_TxnRef) },
      });
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
      if (
        foundOrder?.status === OrderStatus.PAID ||
        foundOrder?.status === OrderStatus.COMPLETED
      ) {
        Logger.error(InpOrderAlreadyConfirmed);
        return JSON.stringify(InpOrderAlreadyConfirmed);
      }

      //update order status to paid
      if (foundOrder) {
        //create payment detail
        const paymentDetail = await this.createPaymentDetail(
          PaymentMethod.VNPAY,
          foundOrder.id,
          verify.vnp_Amount,
          foundOrder.final_price,
        );
        this.updateStatus(
          { orderId: foundOrder.id, status: OrderStatus.PAID },
          paymentDetail.id,
        );
        Logger.log(IpnSuccess);
      }
      return JSON.stringify(IpnSuccess);
    } catch (error) {
      Logger.error(IpnUnknownError);
    }
  }

  async createPaymentDetail(
    method: PaymentMethod,
    orderId: number,
    amount: number,
    final_price: number,
  ) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: {
        name: method,
      },
    });
    const paymentDetailData: any = {
      amount,
      change: amount - final_price,
    };
    if (paymentMethod?.id !== undefined) {
      paymentDetailData.payment_method_id = paymentMethod.id;
    }
    return await this.prisma.paymentDetail.create({
      data: paymentDetailData,
    });
  }

  /**
   * Send order completion email to customer
   * This method is called by RabbitMQ event handler
   */
  async sendOrderCompletionEmail(data: {
    orderId: number;
    customerPhone: string;
    finalPrice: number;
  }) {
    try {
      this.logger.log(
        `📧 Processing order completion email for order ${data.orderId}, customer ${data.customerPhone}`,
      );

      // Get customer email from phone number
      const customer = await this.prisma.user.findUnique({
        where: { phone_number: data.customerPhone },
        select: { email: true, first_name: true, last_name: true },
      });

      if (!customer || !customer.email) {
        this.logger.warn(
          `⚠️ Customer not found or no email for phone ${data.customerPhone}, skipping email`,
        );
        return;
      }

      // Get order details for email content
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
        include: {
          order_details: {
            include: {
              product: { select: { name: true } },
              size: { select: { name: true } },
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`⚠️ Order ${data.orderId} not found, skipping email`);
        return;
      }

      // Format order items for email
      const orderItems = order.order_details
        .map((item) => {
          const sizeText = item.size ? ` (${item.size.name})` : '';
          return `${item.quantity}x ${item.product.name}${sizeText}`;
        })
        .join('<br>');

      const customerName = `${customer.first_name} ${customer.last_name}`.trim() || 'Quý khách';

      // Format price
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price);
      };

      // Send email
      const emailResult = await this.mailService.sendMail(
        customer.email,
        `Đơn hàng #${data.orderId} đã hoàn thành - CoffeeTek`,
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Completed - CoffeeTek</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px 0 30px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td align="center" style="padding: 40px 0 30px 0; background-color: #6F4E37;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">COFFEETEK</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px 40px 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="color: #333333; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                            Chào ${customerName}, đơn hàng của bạn đã hoàn thành! ✅
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555555; font-size: 16px; line-height: 24px; padding-bottom: 30px;">
                            Cảm ơn bạn đã đặt hàng tại CoffeeTek. Đơn hàng #${data.orderId} của bạn đã được hoàn thành và sẵn sàng để bạn thưởng thức!
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff8f0; border-radius: 5px; border-left: 4px solid #6F4E37;">
                              <tr>
                                <td style="padding: 20px;">
                                  <p style="margin: 0 0 10px 0; color: #6F4E37; font-size: 15px; font-weight: bold;">📦 Chi tiết đơn hàng:</p>
                                  <p style="margin: 0 0 15px 0; color: #333333; font-size: 14px; line-height: 22px;">
                                    ${orderItems}
                                  </p>
                                  <p style="margin: 15px 0 0 0; color: #6F4E37; font-size: 16px; font-weight: bold;">
                                    💰 Tổng tiền: ${formatPrice(data.finalPrice)}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 30px; color: #555555; font-size: 14px; line-height: 22px;">
                            Chúng tôi hy vọng bạn sẽ hài lòng với sản phẩm của chúng tôi. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 40px 0 0 0;">
                            <a href="${process.env.FRONTEND_URL || 'https://coffeetek.store'}" style="background-color: #6F4E37; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">XEM LỊCH SỬ ĐƠN HÀNG</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9; color: #888888; font-size: 12px; text-align: center;">
                      &copy; 2026 CoffeeTek Team. All rights reserved.<br>
                      Bạn nhận được email này vì đã đặt hàng tại <a href="${process.env.FRONTEND_URL || 'https://coffeetek.store'}" style="color: #6F4E37;">coffeetek.store</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,
      );

      this.logger.log(
        `✅ Order completion email sent successfully to ${customer.email} for order ${data.orderId}`,
      );
      this.logger.debug(`Email result: ${JSON.stringify(emailResult)}`);
    } catch (error) {
      this.logger.error(
        `❌ Error sending order completion email for order ${data.orderId}:`,
        error,
      );
      throw error; // Re-throw to trigger RabbitMQ nack
    }
  }
}
