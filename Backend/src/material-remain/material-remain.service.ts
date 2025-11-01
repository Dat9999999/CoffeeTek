import { Injectable } from '@nestjs/common';
import { CreateMaterialRemainDto } from './dto/create-material-remain.dto';
import { UpdateMaterialRemainDto } from './dto/update-material-remain.dto';

@Injectable()
export class MaterialRemainService {
  create(createMaterialRemainDto: CreateMaterialRemainDto) {
    return 'This action adds a new materialRemain';
  }

  findAll() {
    return `This action returns all materialRemain`;
  }

  findOne(id: number) {
    return `This action returns a #${id} materialRemain`;
  }

  update(id: number, updateMaterialRemainDto: UpdateMaterialRemainDto) {
    return `This action updates a #${id} materialRemain`;
  }

  remove(id: number) {
    return `This action removes a #${id} materialRemain`;
  }
}
