import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {

  }
  async create(createMaterialDto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        name: createMaterialDto.name,
        unitId: createMaterialDto.unitId
      }
    });
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
