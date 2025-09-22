import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { LoyalityLevelService } from './loyality-level.service';
import { CreateLoyalityLevelDto } from './dto/create-loyality-level.dto';
import { UpdateLoyalityLevelDto } from './dto/update-loyality-level.dto';

@Controller('loyality-level')
export class LoyalityLevelController {
  constructor(private readonly loyalityLevelService: LoyalityLevelService) { }

  @Post()
  create(@Body() createLoyalityLevelDto: CreateLoyalityLevelDto) {
    return this.loyalityLevelService.create(createLoyalityLevelDto);
  }

  @Get()
  findAll() {
    return this.loyalityLevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loyalityLevelService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLoyalityLevelDto: UpdateLoyalityLevelDto) {
    return this.loyalityLevelService.update(id, updateLoyalityLevelDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loyalityLevelService.remove(id);
  }
}
