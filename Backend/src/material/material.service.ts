import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImportMaterialDto } from './dto/import-material.dto';
import { GetAllAdjustmentHistoryDto } from './dto/get-all-adjustment-history.dto';

@Injectable()
export class MaterialService {

  constructor(private readonly prisma: PrismaService) {

  }
  getAdjustmentHistory //store import history here if needed
    (query: GetAllAdjustmentHistoryDto) {
    const { type, date, materialId } = query;
    if (type !== 'import' && type !== 'consume') {
      throw new NotFoundException(`Adjustment history type ${type} is not valid`);
    }
    Logger.log(`Getting adjustment history for type ${type} and date ${date.toISOString()}`, 'MaterialService');
    let startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày

    let endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Thêm một ngày
    endDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày để dùng `lt`

    return this.prisma.inventoryAdjustment.findMany({
      where: {
        adjustedAt: {
          gte: startDate,
          lt: endDate // Lấy tất cả các bản ghi trước 00:00 của ngày tiếp theo
        },
        materialId: materialId,
      }
    });
  }
  async create(createMaterialDto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        name: createMaterialDto.name,
        unitId: createMaterialDto.unitId
      }
    });
  }
  async importMaterial(dto: ImportMaterialDto) {
    const material = await this.prisma.material.update({
      where: { id: dto.materialId },
      data: {
        remain: {
          increment: dto.quantity
        }
      }
    });

    //send log import material here
    Logger.log(`Import material id ${dto.materialId} with quantity ${dto.quantity}`, 'MaterialService');


    //store import history here if needed
    await this.prisma.materialImportation.create({
      data: {
        materialId: dto.materialId,
        importQuantity: dto.quantity,
        // ensure employeeId is provided to satisfy Prisma's required field;
        // cast dto to any to avoid compile errors if DTO type isn't updated yet
        employeeId: (dto as any).employeeId ?? 1, // employeeId = 1 is owner
      }
    });
    return material;
  }
  async findAll() {
    return await this.prisma.material.findMany();
  }

  async findOne(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id: id }
    });
    if (!material) throw new NotFoundException(`Not found order id ${id}`);
    return material
  }

  update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = this.prisma.material.update({
      where: { id: id },
      data: {
        name: updateMaterialDto.name,
        unitId: updateMaterialDto.unitId
      }
    });
    return material;
  }

  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id: id }
    });
    if (!material) throw new NotFoundException(`Not found order id ${id}`);
    if (material.remain > 0) {
      throw new NotFoundException(`Material id ${id} still have remain quantity = ${material.remain}`);
    }
    return await this.prisma.material.delete({
      where: { id: id }
    });
  }
}
