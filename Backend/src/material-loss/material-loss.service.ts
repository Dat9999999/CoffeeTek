import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialLossDto } from './dto/create-material-loss.dto';
import { UpdateMaterialLossDto } from './dto/update-material-loss.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaterialLossService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createMaterialLossDto: CreateMaterialLossDto) {
    const last_remain = await this.prisma.materialRemain.findFirst({ where: { materialId: createMaterialLossDto.materialId, date: createMaterialLossDto.date } });
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

  async findAll() {
    return await this.prisma.watseLog.findMany();
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
}
