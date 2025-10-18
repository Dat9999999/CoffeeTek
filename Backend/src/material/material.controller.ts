import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query, ParseDatePipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ImportMaterialDto } from './dto/import-material.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/strategy/role.strategy';
import { Role } from 'src/auth/decorator/role.decorator';

@Controller('material')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
// @Role('owner', 'manager')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) { }

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Get()
  findAll() {
    return this.materialService.findAll();
  }
  @Get('adjustment-history')
  getAdjustmentHistory(@Query('type') type: string, @Query('date') date: String) {
    return this.materialService.getAdjustmentHistory(type, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(+id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(+id);
  }
  @Post('import')
  importMaterial(@Body() dto: ImportMaterialDto) {
    return this.materialService.importMaterial(dto);
  }
}
