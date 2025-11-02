import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { MaterialLossService } from './material-loss.service';
import { CreateMaterialLossDto } from './dto/create-material-loss.dto';
import { UpdateMaterialLossDto } from './dto/update-material-loss.dto';

@Controller('material-loss')
export class MaterialLossController {
  constructor(private readonly materialLossService: MaterialLossService) { }

  @Post()
  create(@Body() createMaterialLossDto: CreateMaterialLossDto) {
    return this.materialLossService.create(createMaterialLossDto);
  }

  @Get()
  findAll() {
    return this.materialLossService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialLossService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMaterialLossDto: UpdateMaterialLossDto) {
    return this.materialLossService.update(+id, updateMaterialLossDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialLossService.remove(+id);
  }
}
