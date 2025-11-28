import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCotractingDto } from './dto/create-cotracting.dto';
import { UpdateCotractingDto } from './dto/update-cotracting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { getContractingsByDateDto } from './dto/get-contractings-by-date.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { find } from 'rxjs';

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
  async findAll(getContractingsByDateDto: getContractingsByDateDto) {

    const contractings = await this.prisma.contracting.findMany({
      where: {
        created_at: {
          gte: new Date(new Date(getContractingsByDateDto.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(getContractingsByDateDto.date).setHours(23, 59, 59, 999)),
        }
      },
      skip: getContractingsByDateDto.size * (getContractingsByDateDto.page - 1),
      take: getContractingsByDateDto.size,
      orderBy: {
        created_at: 'desc'
      }
    });
    const response = new ResponseGetAllDto();
    response.data = contractings;
    const total = await this.prisma.contracting.count({
      where: {
        created_at: {
          gte: new Date(new Date(getContractingsByDateDto.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(getContractingsByDateDto.date).setHours(23, 59, 59, 999)),
        }
      }
    });
    response.meta = {
      total: total,
      page: getContractingsByDateDto.page,
      size: getContractingsByDateDto.size,
      totalPages: Math.ceil(total / getContractingsByDateDto.size)
    }
    return response;
  }

  async findOne(id: number) {
    const contracting = await this.prisma.contracting.findUnique({
      where: {
        id: id
      }
    });
    if (!contracting) {
      throw new BadRequestException('Contracting not found');
    }
    return contracting;
  }

  async update(id: number, updateCotractingDto: UpdateCotractingDto) {
    return await this.prisma.contracting.update({
      where: {
        id: id,
      },
      data: {
        quantity: updateCotractingDto.quantity,
        created_at: updateCotractingDto.date,
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.contracting.delete({
      where: {
        id: id
      }
    });
  }
}
