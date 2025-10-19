import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query, DefaultValuePipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ImportMaterialDto } from './dto/import-material.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/strategy/role.strategy';
import { Role } from 'src/auth/decorator/role.decorator';
import { ParseDatePipe } from 'src/common/pipe/binding-pipe/parse-date.pipe';
import { GetAllAdjustmentHistoryDto } from './dto/get-all-adjustment-history.dto';
import { UpdateConsumeInventoryDto } from './dto/updadte-adjustment-material.dto';

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
  getAdjustmentHistory(@Query() query: GetAllAdjustmentHistoryDto) {
    return this.materialService.getAdjustmentHistory(query);
  }
  @Put('adjustment-history/confirm')
  // Adjust material stock here if needed
  adjustMaterialStock(@Query('date', new DefaultValuePipe(() => new ParseDatePipe())) date: Date, @Body() updateAdjustmentDto: UpdateConsumeInventoryDto) {
    // Implementation for adjusting material stock
    return this.materialService.adjustMaterialStock(date, updateAdjustmentDto);
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
