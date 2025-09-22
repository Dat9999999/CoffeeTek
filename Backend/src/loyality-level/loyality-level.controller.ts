import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { LoyalityLevelService } from './loyality-level.service';
import { CreateLoyalityLevelDto } from './dto/create-loyality-level.dto';
import { UpdateLoyalityLevelDto } from './dto/update-loyality-level.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/strategy/role.strategy';

@Controller('loyality-level')
export class LoyalityLevelController {
  constructor(private readonly loyalityLevelService: LoyalityLevelService) { }
  @Get()
  findAll() {
    return this.loyalityLevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loyalityLevelService.findOne(id);
  }

  // Only owner or manager 
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('owner', 'manager')
  create(@Body() createLoyalityLevelDto: CreateLoyalityLevelDto) {
    return this.loyalityLevelService.create(createLoyalityLevelDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('owner', 'manager')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLoyalityLevelDto: UpdateLoyalityLevelDto) {
    return this.loyalityLevelService.update(id, updateLoyalityLevelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('owner', 'manager')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loyalityLevelService.remove(id);
  }
}
