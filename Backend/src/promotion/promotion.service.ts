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
    return updatePromotionDto;
  }

  async remove(id: number) {
    return await this.prisma.promotion.delete({ where: { id } });
  }
}
