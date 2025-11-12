import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitService {
  constructor(private readonly prisma: PrismaService) {

  }
  create(createUnitDto: CreateUnitDto) {

    return 'this feature is not available yet';
  }

  async findAll() {
    return await this.prisma.unit.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.unit.findUnique({
      where: {
        id: id
      }
    });
  }

  update(id: number, updateUnitDto: UpdateUnitDto) {
    return 'this feature is not available yet';
  }

  remove(id: number) {
    return 'this feature is not available yet';
  }
}
