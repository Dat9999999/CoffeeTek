import { Injectable } from '@nestjs/common';
import { CreateLoyalLevelDto } from './dto/create-loyal-level.dto';
import { UpdateLoyalLevelDto } from './dto/update-loyal-level.dto';

@Injectable()
export class LoyalLevelService {
  create(createLoyalLevelDto: CreateLoyalLevelDto) {
    return 'This action adds a new loyalLevel';
  }

  findAll() {
    return `This action returns all loyalLevel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} loyalLevel`;
  }

  update(id: number, updateLoyalLevelDto: UpdateLoyalLevelDto) {
    return `This action updates a #${id} loyalLevel`;
  }

  remove(id: number) {
    return `This action removes a #${id} loyalLevel`;
  }
}
