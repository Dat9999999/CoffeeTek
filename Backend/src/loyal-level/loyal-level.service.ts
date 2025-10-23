import { Injectable } from '@nestjs/common';
import { CreateLoyalLevelDto } from './dto/create-loyal-level.dto';
import { UpdateLoyalLevelDto } from './dto/update-loyal-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoyalLevelService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createLoyalLevelDto: CreateLoyalLevelDto) {
    return await this.prisma.loyalLevel.create({
      data: {
        name: createLoyalLevelDto.name,
        required_points: createLoyalLevelDto.requirePoint
      }
    });
  }

  async findAll() {
    return await this.prisma.loyalLevel.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.loyalLevel.findUnique({ where: { id } });
  }

  async update(id: number, updateLoyalLevelDto: UpdateLoyalLevelDto) {
    return await this.prisma.loyalLevel.update({
      where: { id },
      data: {
        name: updateLoyalLevelDto.name,
        required_points: updateLoyalLevelDto.requirePoint
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.loyalLevel.delete({ where: { id } });
  }
}
