import { Injectable } from '@nestjs/common';
import { CreateLoyalityLevelDto } from './dto/create-loyality-level.dto';
import { UpdateLoyalityLevelDto } from './dto/update-loyality-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoyalityLevelService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateLoyalityLevelDto) {
    const newLevel = await this.prisma.loyaltyLevel.create({
      data: {
        name: dto.name,
        discount_rate: dto.discountRate,
        min_point: dto.minPoint,
        max_point: dto.maxPoint,
        description: dto.description
      }
    })
    return newLevel;
  }

  findAll() {
    const levels = this.prisma.loyaltyLevel.findMany();
    if (!levels) {
      throw new Error('No loyalty levels found');
    }
    return levels;
    //
  }

  async findOne(id: number) {
    const level = await this.prisma.loyaltyLevel.findUnique({
      where: { id }
    });
    if (!level) {
      throw new Error('Loyalty level not found');
    }
    return level;
  }

  update(id: number, updateLoyalityLevelDto: UpdateLoyalityLevelDto) {
    const updatedLevel = this.prisma.loyaltyLevel.update({
      where: { id },
      data: {
        name: updateLoyalityLevelDto.name,
        discount_rate: updateLoyalityLevelDto.discountRate,
        min_point: updateLoyalityLevelDto.minPoint,
        max_point: updateLoyalityLevelDto.maxPoint,
        description: updateLoyalityLevelDto.description
      }
    })
    return updatedLevel;
  }

  async remove(id: number) {
    try {
      const deletedLevel = await this.prisma.loyaltyLevel.delete({
        where: { id }
      })
      return deletedLevel;
    } catch (error) {
      return { message: 'Loyalty level not found or already deleted' };
    }

  }
}
