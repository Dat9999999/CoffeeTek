import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialRemainDto } from './dto/create-material-remain.dto';
import { UpdateMaterialRemainDto } from './dto/update-material-remain.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaterialRemainService {
  constructor(private readonly prisma: PrismaService) { }

  async getRemainCheckBySystem(date: Date) {
    date.setUTCHours(0, 0, 0, 0);
    // Ngày tiếp theo: Dùng làm mốc kết thúc (nhỏ hơn < nextDate)
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    // Ngày hôm trước: Dùng làm mốc bắt đầu của kỳ trước (>= lastDate)
    const lastDateStart = new Date(date);
    lastDateStart.setUTCDate(lastDateStart.getUTCDate() - 1);

    // Ngày hôm sau của ngày hôm trước (Date End của kỳ trước)
    const lastDateEnd = new Date(lastDateStart);
    lastDateEnd.setUTCDate(lastDateEnd.getUTCDate() + 1);

    const materials = await this.prisma.material.findMany({ include: { Unit: true }, });
    let res: { 
      materialId: number, 
      materialName: string, 
      materialUnit: string, 
      lastRemainQuantity: number,
      totalContractedToday: number,
      totalConsumedToday: number,
      totalRemainAfterContracting: number | null
    }[] = []

    for (const materialRemain of materials) {
      const materialId = materialRemain.id;

      // TÌM KHO CUỐI KỲ TRƯỚC: Phải nằm trong phạm vi của ngày hôm trước
      const lastRemain = await this.getLastRemain(lastDateEnd, materialId);

      // Get material remain record for today (stored after contracting)
      const todayRemain = await this.prisma.materialRemain.findFirst({
        where: {
          materialId: materialId,
          date: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      // Get all contracting records for today
      const contractingsToday = await this.prisma.contracting.findMany({
        where: {
          materialId: materialId,
          created_at: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      // Calculate total contracted quantity for today
      const totalContractedToday = contractingsToday.reduce(
        (sum, c) => sum + c.quantity,
        0,
      );

      // Get all consumption records for today
      const consumptionsToday = await this.prisma.materialConsumption.findMany({
        where: {
          materialId: materialId,
          date: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      // Calculate total consumed quantity for today
      const totalConsumedToday = consumptionsToday.reduce(
        (sum, c) => sum + c.consumed,
        0,
      );

      // Get total remain after contracting from stored record
      // This is calculated as: old remain - contracting quantity (stored when contracting is created)
      // If no record exists, it means no contracting was created for this material today
      const totalRemainAfterContracting = todayRemain?.remain ?? null;

      res.push({
        materialId: materialId,
        materialName: materialRemain.name,
        materialUnit: materialRemain.Unit?.symbol || materialRemain.Unit?.name || '',
        lastRemainQuantity: !lastRemain ? 0 : lastRemain.remain,
        totalContractedToday: totalContractedToday,
        totalConsumedToday: totalConsumedToday,
        totalRemainAfterContracting: totalRemainAfterContracting,
      });
    }

    return res;
  }

  async getLastRemain(inputDate: Date, materialId: number) {
    inputDate.setUTCHours(0, 0, 0, 0);
    const lastMaterialRemain = await this.prisma.materialRemain.findFirst({
      where: {
        materialId: materialId,
        date: {
          lte: inputDate
        }
      },
      orderBy: {
        date: 'desc'
      },
    });
    return lastMaterialRemain;
  }
  async getLastImport(inputDate: Date, materialId: number) {
    const importation = await this.prisma.materialImportation.findFirst({
      where: {
        materialId: materialId,
        importDate: {
          lt: inputDate
        }
      },
      orderBy: {
        importDate: 'desc'
      }
    });
    return importation;
  }



  async create(createMaterialRemainDto: CreateMaterialRemainDto) {
    const inputDate = new Date(createMaterialRemainDto.date);
    const lastMaterialRemain = await this.getLastRemain(inputDate, createMaterialRemainDto.materialId);

    if (lastMaterialRemain?.date) {
      const lastDate = new Date(lastMaterialRemain.date);
      lastDate.setUTCHours(0, 0, 0, 0);
      if (lastDate.getTime() === inputDate.getTime()) {
        throw new BadRequestException('Material remain record for this date already exists. If you want to update it, please use the update method.');
      }
    }

    const contracting = await this.prisma.contracting.findFirst({
      where: {
        materialId: createMaterialRemainDto.materialId,
        created_at: {
          lt: inputDate
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const importation = await this.getLastImport(inputDate, createMaterialRemainDto.materialId);
    if (contracting && contracting?.quantity < createMaterialRemainDto.actualConsumed) throw new BadRequestException('Actual consumed exceeds contracted quantity.');
    const actualConsumed = createMaterialRemainDto.actualConsumed | (contracting?.quantity ? contracting?.quantity : 0);

    let toDayRemain = (lastMaterialRemain?.remain ? lastMaterialRemain.remain : 0 )+ (importation?.importQuantity || 0) - actualConsumed;
    if (toDayRemain < 0) {
      throw new BadRequestException('Today remain cannot be negative.');
    }
    return await this.prisma.materialRemain.create({
      data: {
        materialId: createMaterialRemainDto.materialId,
        date: createMaterialRemainDto.date,
        remain: toDayRemain
      }
    });
  }

  async findAll() {
    return await this.prisma.materialRemain.findMany({
    });
  }

  async findOne(id: number) {
    return await this.prisma.materialRemain.findUnique({ where: { id } });
  }

  async update(id: number, updateMaterialRemainDto: UpdateMaterialRemainDto) {
    //case actual remain greater than last remain + import
    if (!updateMaterialRemainDto.date) throw new BadRequestException("Date input is required!");
    const materialRemain = await this.prisma.materialRemain.findUnique({
      where: {
        id: id
      }
    });
    if (!materialRemain) throw new BadRequestException(`there is no record of materialRemain with ${id}`);

    const lastRemain = await this.getLastRemain(updateMaterialRemainDto.date, materialRemain.materialId);
    //get today import 
    const lastImport = await this.getLastImport(updateMaterialRemainDto.date, materialRemain.materialId);

    if (!lastRemain || !lastImport) {
      throw new BadRequestException('There no record of last remain or importation');
    }
    if (updateMaterialRemainDto.actualRemain > lastRemain.remain + lastImport.importQuantity) throw new BadRequestException(`actual remains cannot greater than sum of last remain and import`);
    return await this.prisma.materialRemain.update({
      where: { id },
      data: {
        remain: updateMaterialRemainDto.actualRemain
      }
    });
  }

  remove(id: number) {
    return this.prisma.materialRemain.delete({ where: { id } });
  }


  async findOneByMaterialId(materialId: number) {
    // Tìm bản ghi mới nhất theo materialId
    const remain = await this.prisma.materialRemain.findMany({
      where: { materialId },
      orderBy: { date: 'desc' },
      include: {
        Material: {
          include: { Unit: true },
        },
      },
    });

    // Nếu không có -> có thể trả null hoặc throw NotFound
    if (!remain) {
      return null;
      // hoặc: throw new NotFoundException(`No remain found for material ${materialId}`);
    }

    return remain;
  }
}
