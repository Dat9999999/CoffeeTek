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
import { PaymentMethod } from 'src/common/enums/paymentMethod.enum';
import { InvoiceService } from 'src/invoice/invoice.service';
import { B2Service } from 'src/storage-file/b2.service';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class OrderService {


  constructor(private prisma: PrismaService, private readonly vnpayService: VnpayService,
    private readonly invoiceService: InvoiceService,
    private readonly b2Service: B2Service,
    private readonly inventoryService: InventoryService
  ) { }
  async getInvoice(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId
      }
    })
    if (!order) throw new NotFoundException(`Not found invoice of order ${orderId}`)
    if (!order.invoiceUrl) throw new BadRequestException(`order ${orderId} stills pending or canceled`)
    const key = order.invoiceUrl;

    return this.b2Service.getSignedUrl(key)

  }
  // async create(createOrderDto: CreateOrderDto) {
  //   const toppings = await this.prisma.product.findMany({
  //     where: {
  //       id: { in: createOrderDto.order_details.flatMap(i => i.toppingItems?.map(t => parseInt(t.toppingId)) || []) }
  //     }
  //   })
  //   const productSizePrice = await this.prisma.productSize.findMany({
  //     where: {
  //       id: { in: createOrderDto.order_details.flatMap(i => i.sizeId ? [parseInt(i.sizeId)] : []) }
  //     }
  //   })
  //   const order_details = await Promise.all(
  //     createOrderDto.order_details.map(async (item) => {
  //       const product = await this.prisma.product.findUnique({
  //         where: { id: parseInt(item.productId) },
  //         include: {
  //           Recipe: {
  //             include: {
  //               MaterialRecipe: true
  //             }
  //           },
  //         }
  //       });

  //       const toppings = item.toppingItems?.length
  //         ? await this.prisma.product.findMany({
  //           where: { id: { in: item.toppingItems.map(t => parseInt(t.toppingId)) } },
  //         })
  //         : [];

  //       const size = item.sizeId
  //         ? await this.prisma.size.findUnique({
  //           where: { id: parseInt(item.sizeId) },
  //         })
  //         : null;
  //       const sizeIdNum = item.sizeId ? parseInt(item.sizeId) : undefined;
  //       const productSizes = await this.prisma.productSize.findUnique({
  //         where: {
  //           id:
  //             createOrderDto.order_details
  //               .map(i => i.sizeId ? parseInt(i.sizeId) : undefined)
  //               .find(id => id !== undefined && id === sizeIdNum)
  //         },
  //         select: {
  //           id: true,       // This is the ProductSize.id (from dto.sizeId)
  //           price: true,    // This is the correct unit price
  //           size_id: true   // This is the Size.id (for the OrderDetail relation)
  //         }
  //       });

  //       return {
  //         ...item, // giữ lại quantity, productId, toppingItems, sizeId...
  //         product,
  //         toppings,
  //         size,
  //         productSizes
  //       };
  //     })
  //   );

  //   const toppingPrice = (item) => {
  //     return item.toppingItems?.reduce((sum, t) => {
  //       const topping = toppings.find(tp => tp.id === parseInt(t.toppingId));
  //       return sum + ((topping?.price ?? 0) * parseInt(t.quantity));
  //     }, 0) || 0;
  //   };

  //   const original_price = order_details.reduce((sum, item) => {
  //     const defaultProductPrice = item.product?.price || 0;

  //     // đảm bảo sizeId luôn có giá trị hợp lệ
  //     const sizeId = item.sizeId ? parseInt(item.sizeId) : null;
  //     const sizePrice = sizeId
  //       ? productSizePrice.find(s => s.id === sizeId)?.price ?? 0
  //       : 0;

  //     // đảm bảo quantity là số
  //     const quantity = item.quantity ? parseInt(item.quantity.toString()) : 0;

  //     // toppingPrice trả về tổng giá topping (nhân với quantity nếu muốn)
  //     const toppingTotal = toppingPrice(item) * quantity;

  //     return sum + (sizePrice ? sizePrice : defaultProductPrice) * quantity + toppingTotal;
  //   }, 0);



  //   // Tính toán giá gốc và giá cuối cùng sau khi áp dụng voucher/ khuyến mãi khách hàng thân thiết 
  //   const final_price = original_price;
  //   //create order
  //   let order: any = null;
  //   await this.prisma.$transaction(async (tx) => {
  //     for (const item of order_details) {

  //       //throw error if product is inactive
  //       if (
  //         !item.product ||
  //         !item.product.isActive ||
  //         !item.product.Recipe ||
  //         item.product.Recipe.length === 0 ||
  //         // if Recipe is an array, ensure at least one recipe has MaterialRecipe entries
  //         item.product.Recipe.every((r: any) => !r.MaterialRecipe || r.MaterialRecipe.length === 0)
  //       ) {
  //         const productNameOrId = item.product?.name ?? item.productId;
  //         throw new BadRequestException(`Product ${productNameOrId} is inactive or not found`);
  //       }
  //     }

  //     order = await tx.order.create({
  //       data: {
  //         customerPhone: createOrderDto.customerPhone,
  //         original_price: original_price,
  //         final_price: final_price,
  //         note: createOrderDto.note,
  //         staffId: parseInt(createOrderDto.staffId),
  //         order_details: {
  //           create: order_details.map(item => ({
  //             product_name: item.product?.name,
  //             quantity: parseInt(item.quantity),
  //             unit_price: item.productSizes?.price || 0,

  //             product: {
  //               connect: { id: parseInt(item.productId) }
  //             },

  //             size: item.sizeId
  //               ? { connect: { id: parseInt(item.sizeId) } }
  //               : undefined,

  //             ToppingOrderDetail: item.toppingItems?.length
  //               ? {
  //                 create: item.toppingItems.map(t => ({
  //                   quantity: parseInt(t.quantity),
  //                   unit_price: toppings.find((p) => p.id == parseInt(t.toppingId))?.price ?? 0,
  //                   topping: { connect: { id: parseInt(t.toppingId) } }
  //                 }))
  //               }
  //               : undefined,
  //             optionValue: createOrderDto.order_details.map(i => i.optionId)?.length
  //               ? {
  //                 connect: createOrderDto.order_details
  //                   .flatMap(i => i.optionId)
  //                   .map(id => ({ id: parseInt(id) }))
  //               }
  //               : undefined,
  //           }))
  //         },

  //       },
  //       include: {
  //         order_details: {
  //           include: {
  //             product: true,
  //             size: true,
  //             ToppingOrderDetail: {
  //               include: {
  //                 topping: true
  //               }
  //             },
  //             optionValue: {
  //               include: {
  //                 option_group: true
  //               }
  //             }
  //           }
  //         },
  //       },

  //     });


  //   });
  //   return order;
  // }

  async create(dto: CreateOrderDto) {
    const { order_details, customerPhone, staffId, note } = dto;

    if (!order_details || order_details.length === 0) {
      throw new Error('Order must have at least one order detail');
    }

    let original_price = 0;

    const detailsData = await Promise.all(
      order_details.map(async (item) => {
        // Parse IDs to numbers if necessary (assuming DTO transforms them)
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);
        const sizeId = item.sizeId ? Number(item.sizeId) : undefined;

        const product = await this.prisma.product.findUnique({
          where: { id: productId },
          include: {
            sizes: true,
          },
        });

        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        let unit_price: number;

        if (product.is_multi_size) {
          if (!sizeId) {
            throw new Error(`Size is required for multi-size product ${product.name}`);
          }

          const productSize = product.sizes.find((ps) => ps.size_id === sizeId);

          if (!productSize) {
            throw new Error(`Size ID ${sizeId} not available for product ${product.name}`);
          }

          unit_price = productSize.price;
        } else {
          if (sizeId) {
            throw new Error(`Size should not be provided for single-size product ${product.name}`);
          }

          if (product.price === null || product.price === undefined) {
            throw new Error(`Product ${product.name} has no price defined`);
          }

          unit_price = product.price;
        }

        // Validate and prepare options
        const optionConnect = item.optionId
          ? await Promise.all(
            item.optionId.map(async (optIdStr) => {
              const optId = Number(optIdStr);
              const pov = await this.prisma.productOptionValue.findFirst({
                where: {
                  product_id: productId,
                  option_value_id: optId,
                },
              });

              if (!pov) {
                throw new Error(`Option ID ${optId} not available for product ${product.name}`);
              }

              return { id: optId };
            }),
          )
          : [];

        // Validate and prepare toppings
        let toppingData: any = [];
        if (item.toppingItems && item.toppingItems.length > 0) {
          toppingData = await Promise.all(
            item.toppingItems.map(async (topItem) => {
              const toppingId = Number(topItem.toppingId);
              const topQuantity = Number(topItem.quantity);

              const topping = await this.prisma.product.findUnique({
                where: { id: toppingId },
              });

              if (!topping || !topping.isTopping) {
                throw new Error(`Invalid topping ID ${toppingId}`);
              }

              if (topping.is_multi_size) {
                throw new Error(`Multi-size toppings are not supported`);
              }

              if (topping.price === null || topping.price === undefined) {
                throw new Error(`Topping ${topping.name} has no price defined`);
              }

              // Check if topping is available for this product
              const productTopping = await this.prisma.productTopping.findFirst({
                where: {
                  product_id: productId,
                  topping_id: toppingId,
                },
              });

              if (!productTopping) {
                throw new Error(`Topping ${topping.name} not available for product ${product.name}`);
              }

              const topUnitPrice = topping.price;
              original_price += topUnitPrice * topQuantity;

              return {
                quantity: topQuantity,
                unit_price: topUnitPrice,
                topping_id: toppingId,
              };
            }),
          );
        }

        original_price += unit_price * quantity;

        return {
          quantity,
          unit_price,
          product_name: product.name,
          product_id: productId,
          size_id: sizeId,
          optionValue: {
            connect: optionConnect,
          },
          ToppingOrderDetail: {
            create: toppingData,
          },
        };
      }),
    );

    const order = await this.prisma.order.create({
      data: {
        note,
        original_price,
        final_price: original_price, // Assuming no discounts for now; adjust if needed
        Customer: customerPhone ? { connect: { phone_number: customerPhone } } : undefined,
        Staff: { connect: { id: Number(staffId) } },
        order_details: {
          create: detailsData,
        },
      },
    });

    // Assuming you have a findOne method to retrieve the full order with relations
    const new_order_detail = await this.findOne(order.id);
    return new_order_detail;
  }

  async findAll(query: GetAllOrderDto) {
    const {
      page,
      size,
      searchName,
      searchStatus,
      orderBy = 'id',
      orderDirection = 'asc'
    } = query;

    if (!page || !size) {
      throw new Error("page and size are required");
    }

    const skip = (page - 1) * size;

    // Xây dựng điều kiện where động
    const where: any = {};

    if (searchStatus && searchStatus.trim() !== '') {
      where.status = searchStatus;
    }

    if (searchName && searchName.trim() !== '') {
      where.customerPhone = {
        contains: searchName,
        mode: 'insensitive', // không phân biệt hoa thường
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: size,
        where,
        include: {
          order_details: {
            include: {
              product: {
                include: {
                  images: true,
                }
              },
              size: true,
              ToppingOrderDetail: {
                include: {
                  topping: {
                    include: {
                      images: true,
                    }
                  },
                },
              },
              optionValue: {
                include: {
                  option_group: true,
                },
              },
            },
          },
          Customer: true,
          Staff: true,
        },
        orderBy: { [orderBy]: orderDirection },
      }),
      this.prisma.order.count({ where }),
    ]);

    const res: ResponseGetAllDto<any> = {
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };

    return res;
  }


  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_details: {
          include: {
            product: {
              include: {
                images: true,
              }
            },
            size: true,
            ToppingOrderDetail: {
              include: {
                topping: {
                  include: {
                    images: true,
                  }
                }
              }
            },
            optionValue: {
              include: {
                option_group: true
              }
            }
          }
        },
        Customer: true,
        Staff: true,
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
    let order = await this.prisma.order.findUnique({
      where: {
        id: paymentDTO.orderId,
      },
    });
    if (!order) throw new NotFoundException("this order is not exist!");
    if (order.status != OrderStatus.PENDING) throw new BadRequestException("Can only make a payment with order status = pending");
    if (paymentDTO.amount < order.final_price) throw new BadRequestException("Invalid amount, amount must greater or equal final price");
    // if (paymentDTO.amount - (paymentDTO.change ?? 0) <= order.final_price ||
    //   paymentDTO.amount < (paymentDTO.change ?? 0)
    // ) throw new BadRequestException("Change is invalid");


    // validate voucher and apply discount 
    if (paymentDTO.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({ where: { code: paymentDTO.voucherCode } });
      if (!voucher || !voucher.is_active) throw new BadRequestException(`invalid voucher code or voucher is inactive :${paymentDTO.voucherCode}`);

      //update price for order
      order = await this.prisma.order.update({
        where: {
          id: order.id
        },
        data: {
          final_price: order.original_price - (order.original_price * (voucher.discount_percentage / 100))
        }
      })

      //mark voucher was used
      await this.prisma.voucher.update({
        where: {
          id: voucher.id
        },
        data: {
          is_active: false
        }
      })
    }

    //create payment detail
    const paymentDetail = await this.createPaymentDetail(PaymentMethod.CASH, order.id, paymentDTO.amount, order.final_price);

    return this.updateStatus({ orderId: paymentDTO.orderId, status: OrderStatus.PAID }, paymentDetail.id);
  }
  async updateStatus(dto: UpdateOrderStatusDTO, paymentDetailId?: number) {
    const order = await this.prisma.order.update({
      where: {
        id: dto.orderId
      },
      data: {
        status: dto.status,
        paymentDetailId: paymentDetailId
      }
    })

    //create invoice when user paid sucessfully
    if (dto.status == OrderStatus.PAID) {
      const items = await this.prisma.orderDetail.findMany({
        where: {
          order_id: order.id
        }
      })
      const { key, pdfBuffer } = await this.invoiceService.createInvoice(order, items);

      // store this pdf to private bucket
      await this.b2Service.uploadFile(key, pdfBuffer, 'application/pdf', process.env.B2_PRIVATE_BUCKET);

      // store invoice url into db 
      await this.prisma.order.update({
        where: {
          id: dto.orderId
        },
        data: {
          invoiceUrl: key
        }
      })
    }
    //adjust inventory  when order is completed
    if (dto.status == OrderStatus.COMPLETED) {
      const orderDetails = await this.prisma.orderDetail.findMany({
        where: {
          order_id: order.id
        }
      })
      for (const detail of orderDetails) {
        try {
          const inventory_change = await this.inventoryService.adjustInventoryByOrderDetail(detail.product_id, detail.quantity, order.id, detail.size_id ?? undefined);
          Logger.log(`Inventory adjusted: ${JSON.stringify(inventory_change)}`);
        } catch (error: BadRequestException | NotFoundException | Error | any) {
          Logger.error(`Failed to adjust inventory for order detail id ${detail.id}: ${error.message}`);
          return error;
        }
      }

      // accumalate point 
      if (order.customerPhone) {
        let additional_point = order.final_price / 1000;
        await this.prisma.customerPoint.update({
          where: {
            customerPhone: order.customerPhone
          },
          data: {
            points: {
              increment: additional_point
            }
          }
        })
      }
    }
    return order;
  }
  async updateItems(id: number, updateItemsDto: UpdateOrderDto) {
    const toppings = await this.prisma.product.findMany({
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
          ? await this.prisma.product.findMany({
            where: { id: { in: item.toppingItems.map(t => parseInt(t.toppingId)) } },
          })
          : [];

        const size = item.sizeId
          ? await this.prisma.size.findUnique({
            where: { id: parseInt(item.sizeId) },
          })
          : null;
        const sizeIdNum = item.sizeId ? parseInt(item.sizeId) : undefined;
        const productSizes = await this.prisma.productSize.findUnique({
          where: {
            id:
              updateItemsDto?.order_details?.map(i => i.sizeId ? parseInt(i.sizeId) : undefined)
                .find(id => id !== undefined && id === sizeIdNum)
          },
          select: {
            id: true,       // This is the ProductSize.id (from dto.sizeId)
            price: true,    // This is the correct unit price
            size_id: true   // This is the Size.id (for the OrderDetail relation)
          }
        });

        return {
          ...item, // giữ lại quantity, productId, toppingItems, sizeId...
          product,
          toppings,
          size,
          productSizes
        };
      })
    );
    const toppingPrice = (item) => {
      return item.toppingItems?.reduce((sum, t) => {
        const topping = toppings.find(tp => tp.id === parseInt(t.toppingId));
        return sum + (topping != null && topping.price ? topping.price * parseInt(t.quantity) : 0);
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
              unit_price: item.productSizes?.price || 0,

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
              optionValue: updateItemsDto?.order_details?.map(i => i.optionId)?.length
                ? {
                  connect: updateItemsDto?.order_details
                    .flatMap(i => i.optionId)
                    .map(id => ({ id: parseInt(id) }))
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
    let order = await this.prisma.order.findUnique({
      where: { id: paymentDTO.orderId }
    })
    if (!order) throw new NotFoundException();
    // validate voucher and apply discount 
    if (paymentDTO.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({ where: { code: paymentDTO.voucherCode } });
      if (!voucher || !voucher.is_active) throw new BadRequestException(`invalid voucher code or voucher is inactive :${paymentDTO.voucherCode}`);

      //update price for order
      order = await this.prisma.order.update({
        where: {
          id: order.id
        },
        data: {
          final_price: order.original_price - (order.original_price * (voucher.discount_percentage / 100))
        }
      })

      //mark voucher was used
      await this.prisma.voucher.update({
        where: {
          id: voucher.id
        },
        data: {
          is_active: false
        }
      })
    }

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

        //create payment detail 
        const paymentDetail = await this.createPaymentDetail(PaymentMethod.VNPAY, foundOrder.id, verify.vnp_Amount, foundOrder.final_price)
        this.updateStatus({ orderId: foundOrder.id, status: OrderStatus.PAID }, paymentDetail.id);
        Logger.log(IpnSuccess);
      }
      return JSON.stringify(IpnSuccess);
    } catch (error) {
      Logger.error(IpnUnknownError);
    }
  }
  async createPaymentDetail(method: PaymentMethod, orderId: number, amount: number, final_price: number) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: {
        name: method
      }
    })
    const paymentDetailData: any = {
      amount,
      change: amount - final_price
    };
    if (paymentMethod?.id !== undefined) {
      paymentDetailData.payment_method_id = paymentMethod.id;
    }
    return await this.prisma.paymentDetail.create({
      data: paymentDetailData
    })
  }
}
