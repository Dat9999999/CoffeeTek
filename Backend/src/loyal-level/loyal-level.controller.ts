import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { LoyalLevelService } from './loyal-level.service';
import { CreateLoyalLevelDto } from './dto/create-loyal-level.dto';
import { UpdateLoyalLevelDto } from './dto/update-loyal-level.dto';

@Controller('loyal-level')
export class LoyalLevelController {
  constructor(private readonly loyalLevelService: LoyalLevelService) {}

  @Post()
  create(@Body() createLoyalLevelDto: CreateLoyalLevelDto) {
    return this.loyalLevelService.create(createLoyalLevelDto);
  }

  @Get()
  findAll() {
    return this.loyalLevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loyalLevelService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLoyalLevelDto: UpdateLoyalLevelDto,
  ) {
    return this.loyalLevelService.update(+id, updateLoyalLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loyalLevelService.remove(+id);
  }

  @Delete()
  removeMany(@Body() body: { ids: number[] }) {
    return this.loyalLevelService.removeMany(body.ids);
  }
}
