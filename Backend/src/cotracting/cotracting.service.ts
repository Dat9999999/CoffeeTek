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
      }
    })
    const startOfDay = new Date(createCotractingDto.date);
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

    // 2. Get the start of the next day
    const nextDay = new Date(startOfDay);
    nextDay.setDate(startOfDay.getDate() + 1); // Increment by one day

    // 3. Construct the Prisma query
    const importation = await this.prisma.materialImportation.findFirst({
      where: {
        materialId: createCotractingDto.materialId,
        importDate: {
          // Must be on or after the very beginning of the target day
          gte: startOfDay,
          // Must be strictly before the very beginning of the next day
          lt: nextDay,
        }
      }
    });
    const remainsQuantity = remains ? remains.remain : 0;
    const importationQuantity = importation ? importation.importQuantity : 0;
    const totalAvailable = remainsQuantity + importationQuantity;
    if (totalAvailable < createCotractingDto.quantity)
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
