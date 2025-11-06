import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialLossDto } from './dto/create-material-loss.dto';
import { UpdateMaterialLossDto } from './dto/update-material-loss.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAllDto } from 'src/common/dto/pagination.dto';
import { GetAllMaterialLossDto } from './dto/get-all-material-loss.dto';

@Injectable()
export class MaterialLossService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createMaterialLossDto: CreateMaterialLossDto) {

    const last_remain = await this.prisma.materialRemain.findFirst({
      where: {
        materialId: createMaterialLossDto.materialId,
        // date: {
        //   lte: createMaterialLossDto.date, // lấy bản ghi có date <= ngày loss
        // },
      },
      orderBy: {
        date: 'desc', // lấy bản ghi mới nhất trước hoặc bằng ngày đó
      },
    });
    const importMaterials = await this.prisma.materialImportation.findMany({ where: { materialId: createMaterialLossDto.materialId, importDate: createMaterialLossDto.date } })
    const consumes = await this.prisma.inventoryAdjustment.findMany({ where: { materialId: createMaterialLossDto.materialId, adjustedAt: createMaterialLossDto.date } })
    // loss must less than remain + imports + consumes
    const totalConsume = consumes.reduce((sum, i) => sum + i.consume, 0)
    const totalImport = importMaterials.reduce((sum, i) => sum + i.importQuantity, 0)

    if (!last_remain) throw new Error('this material does not exits');

    if (createMaterialLossDto.quantity >= totalConsume + totalImport + (last_remain?.remain)) throw new BadRequestException(`loss is larger than last remain + import + consume `)


    return await this.prisma.watseLog.create({
      data: {
        Mateterial: {
          connect: {
            id: createMaterialLossDto.materialId
          }
        },
        quantity: createMaterialLossDto.quantity,
        date: createMaterialLossDto.date,
        reason: createMaterialLossDto.reason
      },
    });
  }

  async findAll(paginationDto: GetAllMaterialLossDto) {
    const {
      page,
      size,
      orderBy = 'id',
      orderDirection = 'asc',
      searchName,
      date,
    } = paginationDto;
    const skip = (page - 1) * size;
    const where: any = {};
    if (searchName) {
      where.Mateterial = {
        name: {
          contains: searchName,
          mode: 'insensitive',
        },
      };
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }
    const [wasteLogs, total] = await Promise.all([
      this.prisma.watseLog.findMany({
        skip,
        take: size,
        orderBy: { [orderBy]: orderDirection },
        where,
        include: {
          Mateterial: {
            include: { Unit: true },
          },
          User: true,
        },
      }),
      this.prisma.watseLog.count({ where }),
    ]);
    return {
      data: wasteLogs,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }


  async findOne(id: number) {
    const waste = await this.prisma.watseLog.findUnique({ where: { id: id } });
    if (!waste) throw new BadRequestException(`waste id ${id} does not exits`)
    return waste
  }

  async update(id: number, updateMaterialLossDto: UpdateMaterialLossDto) {
    return await this.prisma.watseLog.update({
      where: { id },
      data: {
        materialId: updateMaterialLossDto.materialId,
        quantity: updateMaterialLossDto.quantity,
        date: updateMaterialLossDto.date,
        reason: updateMaterialLossDto.reason
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.watseLog.delete({ where: { id } });
  }

  async removeMany(ids: number[]) {


    const deleted = await this.prisma.watseLog.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      message: `Successfully deleted ${deleted.count} wastage Logs`,
      count: deleted.count,
    };
  }
}
