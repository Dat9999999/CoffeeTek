import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { MaterialRemainService } from './material-remain.service';
import { CreateMaterialRemainDto } from './dto/create-material-remain.dto';
import { UpdateMaterialRemainDto } from './dto/update-material-remain.dto';
import { ParseDatePipe } from 'src/common/pipe/binding-pipe/parse-date.pipe';

@Controller('material-remain')
export class MaterialRemainController {
  constructor(private readonly materialRemainService: MaterialRemainService) { }

  @Post()
  create(@Body() createMaterialRemainDto: CreateMaterialRemainDto) {
    return this.materialRemainService.create(createMaterialRemainDto);
  }

  @Get()
  findAll() {
    return this.materialRemainService.findAll();
  }
  @Get('system-record')
  getSystemTracking(@Query('date', ParseDatePipe) date: Date) {
    return this.materialRemainService.getRemainCheckBySystem(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialRemainService.findOne(+id);
  }
  @Get('/materials/:id')
  findOneByMaterialId(@Param('id') id: string) {
    return this.materialRemainService.findOneByMaterialId(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMaterialRemainDto: UpdateMaterialRemainDto) {
    return this.materialRemainService.update(+id, updateMaterialRemainDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialRemainService.remove(+id);
  }
}
