import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCotractingDto } from './dto/create-cotracting.dto';
import { UpdateCotractingDto } from './dto/update-cotracting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CotractingService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createCotractingDto: CreateCotractingDto) {
    const remains = await this.prisma.materialRemain.findFirst({
      where: {
        materialId: createCotractingDto.materialId,
        date: createCotractingDto.date
      }
    })
    if (!remains || remains.remain < createCotractingDto.quantity)
      throw new BadRequestException('Not enough material remains');

    return this.prisma.contracting.create({
      data: {
        created_at: createCotractingDto.date,
        quantity: createCotractingDto.quantity,
        materialId: createCotractingDto.materialId
      }
    });
  }
  findAll() {
    return `This action returns all cotracting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cotracting`;
  }

  update(id: number, updateCotractingDto: UpdateCotractingDto) {
    return `This action updates a #${id} cotracting`;
  }

  remove(id: number) {
    return `This action removes a #${id} cotracting`;
  }
}
