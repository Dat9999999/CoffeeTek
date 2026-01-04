import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllDto } from '../common/dto/pagination.dto';
import { ClientProxy } from '@nestjs/microservices';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class PromotionService {

  constructor(private readonly prisma: PrismaService,
    @Inject('PROMOTION_MAIL_SERVICE') private readonly client: ClientProxy,
    private readonly mailService: MailService
  ) {

  }

  async create(createPromotionDto: CreatePromotionDto) {
    const newPromotion = await this.prisma.$transaction(async (tx) => {
      // check if any overlap promotion 
      const promotion = await tx.promotion.findMany({
        where: {
          OR: [
            {
              start_date: {
                lte: createPromotionDto.endDate,
              },
              end_date: {
                gte: createPromotionDto.endDate,
              }
            },
            {
              start_date: {
                lte: createPromotionDto.startDate,
              },
              end_date: {
                gte: createPromotionDto.endDate,
              }
            },
            {
              start_date: {
                lte: createPromotionDto.startDate,
              },
              end_date: {
                gte: createPromotionDto.startDate,
              }
            }
          ]
        }
      })

      if (promotion && promotion.length > 0) throw new BadRequestException(`Promotion start ${createPromotionDto.startDate} & end ${createPromotionDto.endDate} is overlaped`)

      return await tx.promotion.create({
        data: {
          start_date: createPromotionDto.startDate,
          end_date: createPromotionDto.endDate,
          name: createPromotionDto.name,
          description: createPromotionDto.description,
          ProductPromotion: {
            create: createPromotionDto.items.map((item) => ({
              Product: { connect: { id: item.productId } },
              ...(item.productSizedId ? { productSize: { connect: { id: item.productSizedId } } }
                : {}),
              new_price: item.newPrice,
            })),
          },
          is_active: false,
        },
      });

    });
    //payload for sending email by MQ
    const payload = {
      id: newPromotion.id,
      name: newPromotion.name,
      startDate: newPromotion.start_date,
      endDate: newPromotion.end_date,
    };
    // Send event to the MQ
    this.client.emit('promotion_created_event', payload);
    return newPromotion;
  }

  async findAll(paginationDto: GetAllDto) {
    const {
      page,
      size,
      orderBy = 'id',
      orderDirection = 'asc',
      searchName,
    } = paginationDto;

    const skip = (page - 1) * size;

    const where: any = {};

    if (searchName) {
      where.name = {
        contains: searchName,
        mode: 'insensitive',
      };
    }

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take: size,
        orderBy: { [orderBy]: orderDirection },
        where,
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return {
      data: promotions,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: number) {
    return await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        ProductPromotion: {
          include: {
            Product: {
              include: {
                images: true,
                sizes: {
                  orderBy: { size: { sort_index: 'asc' } },
                  include: { size: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    await this.prisma.$transaction(async (tx) => {
      if (updatePromotionDto.items && updatePromotionDto.items.length !== 0) {
        // Delete existing product promotions for this promotion once
        await tx.productPromotion.deleteMany({
          where: {
            promotionId: id,
          },
        });

        // Prepare the data for the new items as an array
        const newItemsData = updatePromotionDto.items.map((item) => ({
          productId: item.productId,
          promotionId: id,
          new_price: item.newPrice,
          productSizeId: item.productSizedId
        }));

        // Create ALL the new items using a single createMany operation.
        await tx.productPromotion.createMany({
          data: newItemsData,
        });
      }
      await tx.promotion.update({
        where: { id },
        data: {
          name: updatePromotionDto.name,
          description: updatePromotionDto.description,
          start_date: updatePromotionDto.startDate,
          end_date: updatePromotionDto.endDate,
        },
      });
    });
    const promotionUpdated = await this.findOne(id)
    return promotionUpdated;
  }

  async remove(id: number) {
    return await this.prisma.promotion.delete({ where: { id } });
  }

  // promotion.service.ts
  async toggleActive(id: number, isActive: boolean) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new BadRequestException('Promotion not found');
    }

    // Nếu yêu cầu bật active
    if (isActive) {
      const now = new Date();

      // 1️⃣ Kiểm tra ngày hợp lệ
      if (promotion.start_date > now || promotion.end_date < now) {
        throw new BadRequestException('Cannot activate promotion outside its valid date range');
      }

      // 2️⃣ Kiểm tra có promotion nào khác đang active không
      const existingActive = await this.prisma.promotion.findFirst({
        where: {
          is_active: true,
          id: { not: id },
        },
      });

      if (existingActive) {
        throw new BadRequestException(
          `Another promotion "${existingActive.name}" is already active`,
        );
      }
    }

    // ✅ Cập nhật trạng thái
    return await this.prisma.promotion.update({
      where: { id },
      data: { is_active: isActive },
    });
  }

  async removeMany(ids: number[]) {


    const deleted = await this.prisma.promotion.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      message: `Successfully deleted ${deleted.count} promotions`,
      count: deleted.count,
    };
  }

  async sendPromotionCreatedEvent(data: any, channel: any, originalMsg: any) {
    try {
      console.log(`🚀 Processing batch emails for Promotion: ${data.name} (ID: ${data.id})`);

      // 2. Fetch customers from Database
      const customers = await this.prisma.user.findMany({
        // where: { roles: { has: 'customer' } },
        select: { email: true, }
      });

      // 3. Loop and send emails
      // Note: In real production, use a MailerService (like @nestjs-modules/mailer)

      for (const customer of customers) {
        Logger.log(`Sending email to ${customer.email}...`);
        await this.mailService.sendMail(
          customer.email,
          `New Promotion: ${data.name}`,
          `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CoffeeTek Promotion</title>
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
                            Chào bạn, Coffee mới đã sẵn sàng! ☕
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555555; font-size: 16px; line-height: 24px; padding-bottom: 30px;">
                            Chúng tôi vô cùng hào hứng thông báo chương trình khuyến mãi: 
                            <strong style="color: #6F4E37; font-size: 20px;">"${data.name}"</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff8f0; border-radius: 5px; border-left: 4px solid #6F4E37;">
                              <tr>
                                <td style="padding: 20px; color: #6F4E37; font-size: 15px;">
                                  📅 <strong>Thời gian:</strong> ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}<br>
                                  🎁 <strong>Ưu đãi:</strong> Đừng bỏ lỡ những phần quà đặc biệt dành riêng cho bạn.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 40px 0 0 0;">
                            <a href="${process.env.FRONTEND_URL}" style="background-color: #6F4E37; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">KHÁM PHÁ NGAY</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9; color: #888888; font-size: 12px; text-align: center;">
                      &copy; 2026 CoffeeTek Team. All rights reserved.<br>
                      Bạn nhận được email này vì đã đăng ký thành viên tại <a href="${process.env.FRONTEND_URL}" style="color: #6F4E37;">coffeetek.store</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,);
      }

      // 4. IMPORTANT: Acknowledge the message
      // This tells RabbitMQ the job is done and it can delete the message.
      channel.ack(originalMsg);

      Logger.log('✅ Batch email job completed successfully');
    } catch (error) {
      Logger.error('❌ Error processing batch job:', error);

      // 5. If it fails, we "Nack" it. 
      // requeue: true means put it back in the queue to try again later.
      channel.nack(originalMsg, false, true);
    }
  }
}
