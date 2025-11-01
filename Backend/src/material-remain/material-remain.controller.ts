import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaterialRemainService } from './material-remain.service';
import { CreateMaterialRemainDto } from './dto/create-material-remain.dto';
import { UpdateMaterialRemainDto } from './dto/update-material-remain.dto';

@Controller('material-remain')
export class MaterialRemainController {
  constructor(private readonly materialRemainService: MaterialRemainService) {}

  @Post()
  create(@Body() createMaterialRemainDto: CreateMaterialRemainDto) {
    return this.materialRemainService.create(createMaterialRemainDto);
  }

  @Get()
  findAll() {
    return this.materialRemainService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialRemainService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialRemainDto: UpdateMaterialRemainDto) {
    return this.materialRemainService.update(+id, updateMaterialRemainDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialRemainService.remove(+id);
  }
}
