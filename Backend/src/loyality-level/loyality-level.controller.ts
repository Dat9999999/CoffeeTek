import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoyalityLevelService } from './loyality-level.service';
import { CreateLoyalityLevelDto } from './dto/create-loyality-level.dto';
import { UpdateLoyalityLevelDto } from './dto/update-loyality-level.dto';

@Controller('loyality-level')
export class LoyalityLevelController {
  constructor(private readonly loyalityLevelService: LoyalityLevelService) {}

  @Post()
  create(@Body() createLoyalityLevelDto: CreateLoyalityLevelDto) {
    return this.loyalityLevelService.create(createLoyalityLevelDto);
  }

  @Get()
  findAll() {
    return this.loyalityLevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loyalityLevelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoyalityLevelDto: UpdateLoyalityLevelDto) {
    return this.loyalityLevelService.update(+id, updateLoyalityLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loyalityLevelService.remove(+id);
  }
}
