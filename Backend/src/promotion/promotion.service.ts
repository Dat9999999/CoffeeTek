import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllDto } from '../common/dto/pagination.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPromotionDto: CreatePromotionDto) {
    return await this.prisma.$transaction(async (tx) => {
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

    })
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
}
