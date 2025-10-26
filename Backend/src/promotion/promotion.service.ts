import { Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createPromotionDto: CreatePromotionDto) {

    return await this.prisma.promotion.create({
      data: {
        start_date: createPromotionDto.startDate,
        end_date: createPromotionDto.endDate,
        name: createPromotionDto.name,
        description: createPromotionDto.description,
        ProductPromotion: {
          create: createPromotionDto.items.map(item => ({
            Product: { connect: { id: item.productId } },
            productSize: { connect: { id: item.productSizedId } },
            new_price: item.newPrice,
          })),
        },
      }
    });
  }

  async findAll() {
    return await this.prisma.promotion.findMany({
      include: {
        ProductPromotion: {
          include: {
            Product: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        ProductPromotion: {
          include: {
            Product: true,
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
        const newItemsData = updatePromotionDto.items.map(item => ({
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
