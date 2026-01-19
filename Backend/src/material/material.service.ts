import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImportMaterialDto } from './dto/import-material.dto';
import { GetAllAdjustmentHistoryDto } from './dto/get-all-adjustment-history.dto';
import { GetAllDto, ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { Material, Prisma, Unit } from '@prisma/client';
import { UpdateConsumeInventoryDto } from './dto/updadte-adjustment-material.dto';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) { }

  // async adjustMaterialStock(
  //   date: Date,
  //   updateAdjustmentDto: UpdateConsumeInventoryDto,
  // ) {
  //   //update material consume if any change'
  //   const startDate = new Date(date);
  //   startDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày

  //   const endDate = new Date(date);
  //   endDate.setDate(endDate.getDate() + 1); // Thêm một ngày
  //   endDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày để dùng `lt`

  //   const consumeRecords = await this.prisma.inventoryAdjustment.findMany({
  //     where: {
  //       adjustedAt: {
  //         gte: startDate,
  //         lt: endDate,
  //       },
  //     },
  //     select: {
  //       materialId: true,
  //       consume: true,
  //     },
  //   });

  //   // map materialId to consume
  //   const record = new Map<number, number>();

  //   for (const consumeRecord of consumeRecords) {
  //     const materialId = consumeRecord.materialId;
  //     const currentConsume = consumeRecord.consume;
  //     const prev = record.get(materialId) ?? 0;
  //     record.set(materialId, prev + currentConsume);
  //   }

  //   // reupdate material realistic remain
  //   if (updateAdjustmentDto.items.length > 0) {
  //     for (const item of updateAdjustmentDto.items) {
  //       await this.prisma.$transaction(async (tx) => {
  //         await tx.material.update({
  //           where: {
  //             id: item.materailId,
  //           },
  //           data: {
  //             remain: item.realisticRemain,
  //           },
  //         });
  //       });
  //       // if there is any change remove it out of stock adjustment
  //       record.delete(item.materailId);
  //     }
  //   }
  //   for (const materailId of record.keys()) {
  //     await this.prisma.$transaction(async (tx) => {
  //       const totalConsume = record.get(materailId) ?? 0;
  //       const remainToDeduct = await tx.material.findUnique({
  //         where: {
  //           id: materailId,
  //         },
  //       });
  //       const newRemain = (remainToDeduct?.remain ?? 0) - totalConsume;
  //       await tx.material.update({
  //         where: {
  //           id: materailId,
  //         },
  //         data: {
  //           remain: newRemain >= 0 ? newRemain : 0,
  //         },
  //       });
  //     });
  //   }
  //   return JSON.stringify(record);
  // }

  async getAdjustmentHistory(query: GetAllAdjustmentHistoryDto) {
    //store import history here if needed
    const {
      date,
      materialId,
      orderBy = 'id',
      orderDirection = 'asc',
    } = query;

    Logger.log(
      `Getting adjustment history on date ${date.toISOString()}`,
      'MaterialService',
    );
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày

    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Thêm một ngày
    endDate.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày để dùng `lt`

    const skip = query.size * (query.page - 1);
    let data;
    let total;



    const response: ResponseGetAllDto<
      any
    > = {
      data: data,
      meta: {
        total: total,
        page: query.page,
        size: query.size,
        totalPages: Math.ceil(total / query.size),
      },
    };
    return response;
  }

  async create(createMaterialDto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        name: createMaterialDto.name,
        unitId: createMaterialDto.unitId,
        code: createMaterialDto.code,
      },
    });
  }

  async importMaterial(dto: ImportMaterialDto) {
    // Store import history
    const importation = await this.prisma.materialImportation.create({
      data: {
        materialId: dto.materialId,
        importQuantity: dto.quantity,
        pricePerUnit: dto.pricePerUnit,
        // ensure employeeId is provided to satisfy Prisma's required field;
        // cast dto to any to avoid compile errors if DTO type isn't updated yet
        employeeId: (dto as any).employeeId ?? 1, // employeeId = 1 is owner
      },
    });

    // Get last remain record for this material (most recent)
    const lastRemain = await this.prisma.materialRemain.findFirst({
      where: {
        materialId: dto.materialId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let newRemain: number;

    if (lastRemain) {
      // Update the last remain record directly: add imported quantity
      newRemain = lastRemain.remain + dto.quantity;
      await this.prisma.materialRemain.update({
        where: { id: lastRemain.id },
        data: { remain: newRemain },
      });
    } else {
      // If no remain record exists, create one for today with imported quantity
      newRemain = dto.quantity;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      await this.prisma.materialRemain.create({
        data: {
          materialId: dto.materialId,
          date: today,
          remain: newRemain,
        },
      });
    }

    // send log import material here
    Logger.log(
      `Import material id ${dto.materialId} with quantity ${dto.quantity}, new remain: ${newRemain}`,
      `MaterialService, price per unit : ${dto.pricePerUnit}`,
    );
    return dto;
  }
  async findAll(query: GetAllDto) {
    const { page, size, searchName, orderBy = 'id', orderDirection = 'asc' } = query;
    if (!page || !size) {
      throw new Error("page and size are required");
    }

    const skip = (page - 1) * size;

    let materials: any[] = [];
    let total = 0;

    if (searchName) {
      // Kiểm tra xem có material nào có code === searchName không
      const exactMatch = await this.prisma.material.findFirst({
        where: { code: searchName },
        include: {
          Unit: true, 
          materialRemain: {
            orderBy: { date: 'desc' }, // lấy bản ghi mới nhất
            take: 1, // chỉ lấy 1 bản ghi
          },
          MaterialImportation: true,
        },
      });

      if (exactMatch) {
        // Nếu tìm thấy code khớp -> trả về đúng 1 phần tử này
        materials = [exactMatch];
        total = 1;
      } else {
        // Nếu không tìm thấy code, tìm theo name như bình thường
        [materials, total] = await Promise.all([
          this.prisma.material.findMany({
            skip,
            take: size,
            where: {
              name: { contains: searchName, mode: 'insensitive' },
            },
            include: {
              Unit: true,
              materialRemain: {
                orderBy: { date: 'desc' }, // lấy bản ghi mới nhất
                take: 1, // chỉ lấy 1 bản ghi
              },
              MaterialImportation: true,
            },
            orderBy: { [orderBy]: orderDirection },
          }),
          this.prisma.material.count({
            where: { name: { contains: searchName, mode: 'insensitive' } },
          }),
        ]);
      }
    } else {
      // Trường hợp không có searchName
      [materials, total] = await Promise.all([
        this.prisma.material.findMany({
          skip,
          take: size,
          include: {
            Unit: true,
            materialRemain: {
              orderBy: { date: 'desc' }, // lấy bản ghi mới nhất
              take: 1, // chỉ lấy 1 bản ghi
            },
            MaterialImportation: true,
          },
          orderBy: { [orderBy]: orderDirection },
        }),
        this.prisma.material.count(),
      ]);
    }

    // Helper function to calculate average cost from importations
    const calculateAverageCost = (importations: any[]): number => {
      if (!importations || importations.length === 0) {
        return 0;
      }

      const totalValue = importations.reduce(
        (sum, imp) => sum + (imp.pricePerUnit * imp.importQuantity),
        0,
      );
      const totalQuantity = importations.reduce(
        (sum, imp) => sum + imp.importQuantity,
        0,
      );

      return totalQuantity > 0 ? totalValue / totalQuantity : 0;
    };

    const data = materials.map((m) => ({
      id: m.id,
      name: m.name,
      remain: m.materialRemain.length > 0 ? m.materialRemain[0].remain : null,
      code: m.code,
      unit: m.Unit,
      averageCost: calculateAverageCost(m.MaterialImportation || []),
    }));

    const res: ResponseGetAllDto<any> = {
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };

    return res;
  }


  async findOne(id: number) {
    const m = await this.prisma.material.findUnique({
      where: { id },
      include: {
        Unit: true,
        materialRemain: {
          orderBy: { date: 'desc' }, // lấy bản ghi mới nhất
          take: 1, // chỉ lấy 1 bản ghi
        },
        MaterialImportation: {
          orderBy: { importDate: 'desc' },
        },
      },
    });

    if (!m) throw new NotFoundException(`Not found material id ${id}`);

    return {
      id: m.id,
      name: m.name,
      code: m.code,
      unit: m.Unit,
      remain: m.materialRemain.length > 0 ? m.materialRemain[0].remain : null,
    };
  }

  update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = this.prisma.material.update({
      where: { id: id },
      data: {
        name: updateMaterialDto.name,
        unitId: updateMaterialDto.unitId,
        code: updateMaterialDto.code
      },
    });
    return material;
  }

  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id: id },
    });
    if (!material) throw new NotFoundException(`Not found order id ${id}`);
    // if (material.remain > 0) {
    //   throw new NotFoundException(
    //     `Material id ${id} still have remain quantity = ${material.remain}`,
    //   );
    // }
    return await this.prisma.material.delete({
      where: { id: id },
    });
  }

  async removeMany(ids: number[]) {
    const deleted = await this.prisma.material.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      message: `Successfully deleted ${deleted.count} materials`,
      count: deleted.count,
    };
  }
}
