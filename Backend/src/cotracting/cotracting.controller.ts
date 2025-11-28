import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CotractingService } from './cotracting.service';
import { CreateCotractingDto } from './dto/create-cotracting.dto';
import { UpdateCotractingDto } from './dto/update-cotracting.dto';
import { getContractingsByDateDto } from './dto/get-contractings-by-date.dto';

@Controller('cotracting')
export class CotractingController {
  constructor(private readonly cotractingService: CotractingService) { }

  @Post()
  create(@Body() createCotractingDto: CreateCotractingDto) {
    return this.cotractingService.create(createCotractingDto);
  }

  @Get()
  findAll(@Body() getContractingsByDateDto: getContractingsByDateDto) {
    return this.cotractingService.findAll(getContractingsByDateDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotractingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCotractingDto: UpdateCotractingDto) {
    return this.cotractingService.update(+id, updateCotractingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cotractingService.remove(+id);
  }
}
