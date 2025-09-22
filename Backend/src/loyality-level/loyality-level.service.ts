import { Injectable } from '@nestjs/common';
import { CreateLoyalityLevelDto } from './dto/create-loyality-level.dto';
import { UpdateLoyalityLevelDto } from './dto/update-loyality-level.dto';

@Injectable()
export class LoyalityLevelService {
  create(createLoyalityLevelDto: CreateLoyalityLevelDto) {
    return 'This action adds a new loyalityLevel';
  }

  findAll() {
    return `This action returns all loyalityLevel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} loyalityLevel`;
  }

  update(id: number, updateLoyalityLevelDto: UpdateLoyalityLevelDto) {
    return `This action updates a #${id} loyalityLevel`;
  }

  remove(id: number) {
    return `This action removes a #${id} loyalityLevel`;
  }
}
