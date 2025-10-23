import { Injectable } from '@nestjs/common';
import { CreateLoyalLevelDto } from './dto/create-loyal-level.dto';
import { UpdateLoyalLevelDto } from './dto/update-loyal-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoyalLevelService {
  constructor(private readonly prisma: PrismaService) { }
  create(createLoyalLevelDto: CreateLoyalLevelDto) {
    return 'This action adds a new loyalLevel';
  }

  async findAll() {
    return await this.prisma.loyalLevel.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} loyalLevel`;
  }

  update(id: number, updateLoyalLevelDto: UpdateLoyalLevelDto) {
    return `This action updates a #${id} loyalLevel`;
  }

  remove(id: number) {
    return `This action removes a #${id} loyalLevel`;
  }
}
