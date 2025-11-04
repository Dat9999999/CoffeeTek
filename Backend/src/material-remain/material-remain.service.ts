import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaterialRemainDto } from './dto/create-material-remain.dto';
import { UpdateMaterialRemainDto } from './dto/update-material-remain.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { error } from 'console';

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
    const materials = await this.prisma.material.findMany();
    let res: { record: number; materialId: number }[] = []

    for (const materialRemain of materials) {
      const materialId = materialRemain.id;

      // TÌM KHO CUỐI KỲ TRƯỚC: Phải nằm trong phạm vi của ngày hôm trước
      const lastRemain = await this.prisma.materialRemain.findFirst({
        where: {
          materialId: materialId,
          date: {
            gte: lastDateStart, // Lớn hơn hoặc bằng 00:00:00 ngày hôm trước
            lt: lastDateEnd     // Nhỏ hơn 00:00:00 ngày hiện tại (hay 1 ngày sau)
          }
        },
        orderBy: { date: 'desc' } // Đảm bảo lấy bản ghi mới nhất trong ngày
      });

      // TÌM NHẬP HÀNG: Phải nằm trong phạm vi của ngày hiện tại
      const importMaterial = await this.prisma.materialImportation.findFirst({
        where: {
          materialId: materialId,
          importDate: {
            gte: date, // Lớn hơn hoặc bằng 00:00:00 ngày hiện tại
            lt: nextDate                       // Nhỏ hơn 00:00:00 ngày tiếp theo
          }
        },
        orderBy: { importDate: 'desc' } // Lấy bản ghi mới nhất nếu có nhiều lần nhập trong ngày
      });

      // TÍNH TỔNG TIÊU THỤ (Consume): Phải nằm trong phạm vi của ngày hiện tại
      const totalConsume = await this.prisma.inventoryAdjustment
        .findMany({
          where: {
            materialId: materialId,
            adjustedAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
        .then(e => e.reduce((sum, i) => sum + i.consume, 0));

      // TÍNH TỔNG HỎNG/THẢI (Loss): Phải nằm trong phạm vi của ngày hiện tại
      const loss = await this.prisma.watseLog
        .findMany({
          where: {
            materialId: materialId,
            date: {
              gte: date,
              lt: nextDate
            }
          }
        })
        .then(e => e.reduce((sum, i) => sum + i.quantity, 0));

      // Kiểm tra logic và tính toán
      if (!lastRemain || !importMaterial) {
        // Cần điều chỉnh logic kiểm tra: nếu không có tồn kho cuối kỳ trước, coi là 0.
        // Nếu không có nhập hàng, coi là 0.
        const lastRemainQuantity = lastRemain ? lastRemain.remain : 0;
        const importQuantity = importMaterial ? importMaterial.importQuantity : 0;

        // Nếu bạn muốn giữ lại lỗi khi không tìm thấy TỒN KHO HOẶC NHẬP HÀNG:
        // throw new BadRequestException(`Can not find last remain or importation for material ${materialId}`); 

        // Nếu cho phép tồn kho/nhập hàng = 0, bạn dùng logic sau:
        const systemrecord = {

          record: lastRemainQuantity + importQuantity - (totalConsume + loss),
          materialId: materialId
        }
        res.push(systemrecord)

      } else {
        const systemrecord = {
          record: lastRemain.remain + importMaterial.importQuantity - (totalConsume + loss),
          materialId: materialId
        }
        res.push(systemrecord)
      }
    }

    return res;
  }



  async create(createMaterialRemainDto: CreateMaterialRemainDto) {

    for (const material of createMaterialRemainDto.remainReality) {
      await this.prisma.materialRemain.create({
        data: {
          remain: material.remain,
          date: createMaterialRemainDto.date,
          Material: {
            connect: { id: material.materialId }
          }

        }
      })
    }

    // Đã bỏ qua sửa lỗi forEach/async để tập trung vào vấn đề ngày tháng.
    return createMaterialRemainDto;
  }

  async findAll() {
    return await this.prisma.materialRemain.findMany({
    });
  }

  async findOne(id: number) {
    return await this.prisma.materialRemain.findUnique({ where: { id } });
  }

  async update(id: number, updateMaterialRemainDto: UpdateMaterialRemainDto) {
    await this.prisma.materialRemain.update({
      where: { id },
      data: {
        remain: updateMaterialRemainDto.remain,
        date: updateMaterialRemainDto.date,
        Material: {
          connect: { id: updateMaterialRemainDto.materialId }
        }

      }
    })
    return updateMaterialRemainDto;
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
